const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const writeStreamData = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body

    if (!stream) {
      return res.status(400).json({ error: { code: "NON_STREAM_UNSUPPORTED", message: "Esta rota foi refatorada para suportar apenas streaming com status detalhados." } })
    }

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    let systemPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
    if (!systemPrompt) systemPrompt = prompts[0]

    const messages = [systemPrompt, ...userPrompts]

    const requestOptions = { model, stream: true, plugins: plugins ? plugins : undefined }

    if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
      const filteredBuiltInTools = builtInTools.filter((tool) => use_tools.includes(tool.function.name))
      const userCustomTools = await Tool.find({ user: req.userID, name: { $in: use_tools } })
      const customToolSchemas = userCustomTools.map(tool => ({
        type: "function",
        function: { name: tool.name, description: tool.description, parameters: tool.parameters }
      }))
      const finalTools = [...filteredBuiltInTools, ...customToolSchemas]
      if (finalTools.length > 0) {
        requestOptions.tools = finalTools
        requestOptions.tool_choice = "auto"
      }
    }

    const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)

    let aggregatedToolCalls = []
    let hasToolCall = false

    for await (const chunk of streamResponse) {
      const delta = chunk.choices[0]?.delta

      if (delta && delta.content) {
        writeStreamData(res, { type: "delta", delta: { content: delta.content } })
      }

      if (delta && delta.tool_calls) {
        hasToolCall = true
        delta.tool_calls.forEach(toolCallChunk => {
          const existingCall = aggregatedToolCalls[toolCallChunk.index]
          if (!existingCall) {
            aggregatedToolCalls[toolCallChunk.index] = { ...toolCallChunk.function, id: toolCallChunk.id, index: toolCallChunk.index }
          } else {
            if (toolCallChunk.function?.arguments) {
              existingCall.arguments += toolCallChunk.function.arguments
            }
          }
        })
      }
    }

    if (!hasToolCall) {
      return res.end()
    }

    const finalToolCalls = aggregatedToolCalls.map(call => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: call.arguments }
    }))

    messages.push({ role: "assistant", tool_calls: finalToolCalls })

    for (const toolCall of finalToolCalls) {
      writeStreamData(res, { type: "status", status: "TOOL_CALL", tool: { name: toolCall.function.name, state: "CALLING" } })
    }

    const allUserCustomTools = await Tool.find({ user: req.userID })

    for (const toolCall of finalToolCalls) {
      const functionName = toolCall.function.name
      let functionArgs
      try {
        functionArgs = JSON.parse(toolCall.function.arguments)
      } catch (e) {
        writeStreamData(res, { type: "status", status: "TOOL_EXECUTION", tool: { name: functionName, state: "FAILURE", message: "Argumentos JSON inválidos fornecidos pela IA." } })
        messages.push({ tool_call_id: toolCall.id, role: "tool", name: functionName, content: `{"error": "Argumentos JSON inválidos fornecidos pela IA."}` })
        continue
      }

      let functionResponseContent = ""

      try {
        const customTool = allUserCustomTools.find(t => t.name === functionName)
        if (customTool) {
          let { url, queryParams, headers, body } = customTool.httpConfig
          const replacePlaceholders = (template) => {
            if (!template) return template
            let processed = JSON.stringify(template)
            Object.keys(functionArgs).forEach(key => {
              const regex = new RegExp(`{{${key}}}`, "g")
              processed = processed.replace(regex, functionArgs[key])
            })
            return JSON.parse(processed)
          }
          let finalUrl = new URL(replacePlaceholders(url))
          if (queryParams) {
            const processedQueryParams = replacePlaceholders(queryParams)
            const searchParams = new URLSearchParams(finalUrl.search)
            for (const key in processedQueryParams) {
              searchParams.set(key, processedQueryParams[key])
            }
            finalUrl.search = searchParams.toString()
          }
          const httpConfig = {
            method: customTool.httpConfig.method,
            url: finalUrl.toString(),
            headers: replacePlaceholders(headers),
            body: replacePlaceholders(body)
          }
          const functionResponse = await availableTools.httpTool(httpConfig)
          functionResponseContent = JSON.stringify(functionResponse.data)
        } else if (availableTools[functionName]) {
          const functionToCall = availableTools[functionName]
          const functionResponse = await functionToCall(...Object.values(functionArgs))
          functionResponseContent = JSON.stringify(functionResponse.data)
        } else {
          throw new Error(`A ferramenta "${functionName}" não foi encontrada ou não está ativa.`)
        }

        writeStreamData(res, { type: "status", status: "TOOL_EXECUTION", tool: { name: functionName, state: "SUCCESS" } })
        messages.push({ tool_call_id: toolCall.id, role: "tool", name: functionName, content: functionResponseContent })

      } catch (toolError) {
        console.error(`[TOOL_EXECUTION_ERROR] Falha ao executar ${functionName}:`, toolError)
        const errorMessage = toolError.message || "Ocorreu um erro desconhecido na ferramenta."
        writeStreamData(res, { type: "status", status: "TOOL_EXECUTION", tool: { name: functionName, state: "FAILURE", message: errorMessage } })
        messages.push({ tool_call_id: toolCall.id, role: "tool", name: functionName, content: JSON.stringify({ error: errorMessage }) })
      }
    }

    writeStreamData(res, { type: "status", status: "TOOL_PROCESSING", tool: null })

    const secondCallOptions = { model, stream: true }
    const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)
    writeStreamData(res, { type: "status", status: "TOOL_PROCESSING_COMPLETE", tool: null })
    for await (const finalChunk of finalResponseStream) {
      const delta = finalChunk.choices[0]?.delta
      if (delta && delta.content) {
        writeStreamData(res, { type: "delta", delta: { content: delta.content } })
      }
    }

    return res.end()

  } catch (error) {
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (!res.headersSent) {
      const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
      const { status, message } = defaultError
      return res.status(status).json({ error: { code: error.message, message } })
    } else {
      writeStreamData(res, { type: "error", error: { code: error.message, message: "Ocorreu um erro durante o processamento do stream." } })
      res.end()
    }
  }
}

module.exports = sendMessage

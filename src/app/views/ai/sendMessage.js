const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body

    let systemPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
    if (!systemPrompt) systemPrompt = prompts[0]
    let messages = [systemPrompt, ...userPrompts]

    const toolsAreActive = use_tools && Array.isArray(use_tools) && use_tools.length > 0

    if (!toolsAreActive) {
      const requestOptions = { model, stream, plugins: plugins ? plugins : undefined }
      if (stream) {
        const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)
        res.setHeader("Content-Type", "text/event-stream")
        for await (const chunk of streamResponse) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
        return res.end()
      } else {
        const { status, data } = await ask(aiProvider, aiKey, messages, requestOptions)
        return res.status(status).json(data)
      }
    }

    const requestOptions = { model, stream: false }
    const filteredBuiltInTools = builtInTools.filter((tool) => use_tools.includes(tool.function.name))
    const userCustomTools = await Tool.find({ user: req.userID, name: { $in: use_tools } })
    const customToolSchemas = userCustomTools.map(tool => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    }))
    requestOptions.tools = [...filteredBuiltInTools, ...customToolSchemas]
    requestOptions.tool_choice = "auto"

    const { data } = await ask(aiProvider, aiKey, messages, requestOptions)
    const resMsg = data.choices[0].message

    if (!resMsg.tool_calls) {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream")
        const chunk = { choices: [{ delta: { content: resMsg.content || "" } }] }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        return res.end()
      }
      return res.status(200).json(data)
    }

    messages.push(resMsg)

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      const decisionUpdate = { custom_event: "tool_decision", tools: resMsg.tool_calls.map(t => t.function.name) }
      res.write(`data: ${JSON.stringify(decisionUpdate)}\n\n`)
    }

    const allUserCustomTools = await Tool.find({ user: req.userID })

    try {
      if (stream) {
        const executionStartUpdate = { custom_event: "tool_execution_start", tools: resMsg.tool_calls.map(t => t.function.name) }
        res.write(`data: ${JSON.stringify(executionStartUpdate)}\n\n`)
      }

      const toolPromises = resMsg.tool_calls.map(async (toolCall) => {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
        let rawResponseData = null

        const customTool = allUserCustomTools.find(t => t.name === functionName)
        const builtInTool = availableTools[functionName]

        if (customTool) {
          console.log(`[CUSTOM TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
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
            for (const key in processedQueryParams) {
              finalUrl.searchParams.set(key, processedQueryParams[key])
            }
          }
          const httpConfig = {
            method: customTool.httpConfig.method,
            url: finalUrl.toString(),
            headers: replacePlaceholders(headers),
            body: replacePlaceholders(body)
          }
          const functionResponse = await availableTools.httpTool(httpConfig)
          rawResponseData = functionResponse.data
        } else if (builtInTool) {
          console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
          const functionResponse = await builtInTool(...Object.values(functionArgs))
          rawResponseData = functionResponse.data !== undefined ? functionResponse.data : functionResponse
        } else {
          console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
          rawResponseData = { error: `A ferramenta "${functionName}" não foi encontrada ou não está ativa.` }
        }

        return {
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(rawResponseData) // ** VOLTAMOS A ENVIAR O RESULTADO BRUTO **
        }
      })

      const toolResults = await Promise.all(toolPromises)
      messages.push(...toolResults)

      if (stream) {
        const processingUpdate = { custom_event: "tool_processing_start", message: "Resultados recebidos, a processar a resposta final..." }
        res.write(`data: ${JSON.stringify(processingUpdate)}\n\n`)
      }

      const secondCallOptions = { model, stream }
      const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)

      if (stream) {
        for await (const finalChunk of finalResponse) {
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
        }
        return res.end()
      } else {
        return res.status(finalResponse.status).json(finalResponse.data)
      }
    } catch (toolError) {
      console.error("--- ERRO NA EXECUÇÃO DA FERRAMENTA ---", toolError)
      if (stream) {
        const errorUpdate = { custom_event: "tool_execution_error", error: toolError.message || "Uma das ferramentas falhou ao ser executada." }
        res.write(`data: ${JSON.stringify(errorUpdate)}\n\n`)
        return res.end()
      } else {
        return res.status(500).json({ error: { message: "Falha ao executar a ferramenta." } })
      }
    }

  } catch (error) {
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, {
      error: error.message,
      stack: error.stack,
      aiProvider: req.body.aiProvider,
      model: req.body.model
    })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida. Verifique suas credenciais." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido. Tente novamente mais tarde." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com o serviço de IA. Tente novamente." },
      TOOL_ERROR: { status: 500, message: "Falha ao executar ferramentas." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = sendMessage

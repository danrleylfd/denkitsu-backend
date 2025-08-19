const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body

    // 1. Preparação inicial das mensagens e ferramentas
    let systemPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
    if (!systemPrompt) systemPrompt = prompts[0]
    const messages = [systemPrompt, ...userPrompts]

    const requestOptions = { model, stream: true, plugins: plugins ? plugins : undefined } // Sempre iniciamos com stream para checar por ferramentas

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

    // 2. Primeira chamada para a IA (sempre em modo stream)
    const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
    }

    let aggregatedToolCalls = []
    let hasToolCall = false
    let firstChunk = null
    let hasSentContent = false

    // 3. Processar o stream inicial da IA
    for await (const chunk of streamResponse) {
      if (!firstChunk) firstChunk = chunk

      const delta = chunk.choices[0]?.delta
      if (delta && delta.tool_calls) {
        hasToolCall = true
        // Agrega os "pedaços" da chamada de ferramenta que chegam no stream
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

      // Se o modo stream estiver ligado e o chunk for de conteúdo, envie para o frontend
      if (stream && delta && delta.content) {
        hasSentContent = true
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    }

    // 4. Se não houve chamada de ferramenta, a conversa termina aqui
    if (!hasToolCall) {
      if (stream) {
        return res.end() // Finaliza o stream se só houve texto
      } else {
        // Se o stream estava desligado, retorna a primeira (e única) resposta completa
        return res.status(200).json(firstChunk)
      }
    }

    // 5. Se HOUVE uma chamada de ferramenta, continue o processo
    const finalToolCalls = aggregatedToolCalls.map(call => ({
      id: call.id,
      type: "function",
      function: {
        name: call.name,
        arguments: call.arguments
      }
    }))

    messages.push({ role: "assistant", tool_calls: finalToolCalls })

    // Envia o status para o frontend via stream (se aplicável)
    if (stream) {
      for (const toolCall of finalToolCalls) {
        const statusUpdate = {
          choices: [{ delta: { tool_calls: [{ index: toolCall.index, function: { name: toolCall.function.name, arguments: "" } }] } }]
        }
        res.write(`data: ${JSON.stringify(statusUpdate)}\n\n`)
      }
    }

    const allUserCustomTools = await Tool.find({ user: req.userID })
    // Executa todas as ferramentas que a IA solicitou
    for (const toolCall of finalToolCalls) {
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)
      let functionResponseContent = ""

      const customTool = allUserCustomTools.find(t => t.name === functionName)
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
        console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
        const functionToCall = availableTools[functionName]
        const functionResponse = await functionToCall(...Object.values(functionArgs))
        functionResponseContent = JSON.stringify(functionResponse.data)
      } else {
        console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
        functionResponseContent = JSON.stringify({ error: `A ferramenta "${functionName}" não foi encontrada ou não está ativa.` })
      }

      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: functionResponseContent
      })
    }

    // 6. Chame a IA novamente com o resultado das ferramentas
    const secondCallOptions = { model, stream: stream }
    const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)

    // 7. Envie a resposta final para o frontend
    if (stream) {
      for await (const finalChunk of finalResponse) {
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
      }
      return res.end()
    } else {
      return res.status(finalResponse.status).json(finalResponse.data)
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

const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const Agent = require("../../models/agent")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body
    let systemPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
    if (!systemPrompt) {
      const customAgent = await Agent.findOne({ user: req.userID, name: mode })
      if (customAgent && customAgent.prompt) {
        const { goal, returnFormat, warning, contextDump } = customAgent.prompt
        systemPrompt = {
          role: "system",
          content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}`
        }
      }
    }
    if (!systemPrompt) systemPrompt = prompts[0]
    let messages = [systemPrompt, ...userPrompts]
    const allUserCustomTools = await Tool.find({ user: req.userID })
    const customToolSchemas = allUserCustomTools.map(tool => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    }))
    const requestOptions = { model, plugins: plugins ? plugins : undefined }
    use_tools.push("promptTool")
    if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
      const filteredBuiltInTools = builtInTools.filter((tool) => use_tools.includes(tool.function.name))
      const filteredCustomTools = customToolSchemas.filter(tool => use_tools.includes(tool.function.name))
      const activeTools = [...filteredBuiltInTools, ...filteredCustomTools]
      if (activeTools.length > 0) {
        requestOptions.tools = activeTools
        requestOptions.tool_choice = "auto"
      }
    }
    const { data: initialResponseData } = await ask(aiProvider, aiKey, messages, { ...requestOptions, stream: false })
    const responseMessage = initialResponseData.choices[0].message
    let finalMessages
    let finalResponse
    if (responseMessage.tool_calls && responseMessage.tool_calls[0]?.function.name === "promptTool") {
      console.log("[AGENT_ROUTER] promptTool chamada. Trocando de agente...")
      const toolCall = responseMessage.tool_calls[0]
      const functionArgs = JSON.parse(toolCall.function.arguments)
      const { data: promptData } = await availableTools.promptTool(...Object.values(functionArgs))
      if (promptData.content) {
        const newSystemPrompt = { role: "system", content: promptData.content }
        console.log(`[AGENT_ROUTER] Carregando o agente: ${promptData.agente}`)
        finalMessages = [newSystemPrompt, ...userPrompts]
        finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
      }
    }
    else if (responseMessage.tool_calls) {
      console.log("[TOOL_HANDLER] Ferramenta(s) chamada(s). Executando...")
      messages.push(responseMessage)
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
        let functionResponseContent = ""
        const customTool = allUserCustomTools.find(t => t.name === functionName)
        if (customTool) {
          console.log(`[CUSTOM_TOOL_CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
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
          functionResponseContent = JSON.stringify({ error: `A ferramenta "${functionName}" não foi encontrada.` })
        }
        messages.push({ tool_call_id: toolCall.id, role: "tool", name: functionName, content: functionResponseContent })
      }
      finalMessages = messages
      finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
    }
    else {
      finalResponse = { data: initialResponseData }
    }
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      if (finalResponse[Symbol.asyncIterator]) {
        for await (const chunk of finalResponse) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
      } else {
        res.write(`data: ${JSON.stringify(finalResponse.data)}\n\n`)
      }
      return res.end()
    } else {
      return res.status(200).json(finalResponse.data)
    }
  } catch (error) {
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack, aiProvider: req.body.aiProvider, model: req.body.model })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com a IA." },
      TOOL_ERROR: { status: 500, message: "Falha ao executar ferramentas." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    if (!res.headersSent) {
      return res.status(status).json({ error: { code: error.message, message } })
    } else {
      res.write(`data: ${JSON.stringify({ error: { code: error.message, message } })}\n\n`)
      res.end()
    }
  }
}

module.exports = sendMessage

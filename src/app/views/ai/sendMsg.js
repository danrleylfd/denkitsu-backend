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
    const messages = [systemPrompt, ...userPrompts]
    const requestOptions = { model, stream, plugins: plugins ? plugins : undefined }
    if (stream) {
      const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      for await (const chunk of streamResponse) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
      return res.end()
    }
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
        console.log(`[TOOL CONTROL] Usando as seguintes ferramentas: ${use_tools.join(", ")}`)
      }
    }
    const { status, data } = await ask(aiProvider, aiKey, messages, requestOptions)
    const resMsg = data.choices[0].message
    if (resMsg.tool_calls) {
      messages.push(resMsg)
      const allUserCustomTools = await Tool.find({ user: req.userID })
      for (const toolCall of resMsg.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
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
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(functionResponse.data)
          })
          continue
        } else if (availableTools[functionName]) {
          console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
          if (functionName === "httpTool") {
            const functionResponse = await availableTools.httpTool(functionArgs)
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify(functionResponse.data)
            })
            continue
          }
          const functionToCall = availableTools[functionName]
          const functionResponse = await functionToCall(...Object.values(functionArgs))
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(functionResponse.data)
          })
        } else {
          console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify({ error: `A ferramenta "${functionName}" não foi encontrada ou não está ativa.` })
          })
        }
      }
      const sanitizedMessages = sanitizeMessages(messages)
      const finalResponse = await ask(aiProvider, aiKey, sanitizedMessages, { model })
      return res.status(finalResponse.status).json(finalResponse.data)
    }
    return res.status(status).json(data)
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

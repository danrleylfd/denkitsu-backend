const { ask } = require("../api/ai")
const { availableTools, tools } = require("../tools")
const allPrompts = require("../prompts")

const cleanMessageHistory = (messages = [], limit = 20) => {
  if (!Array.isArray(messages) || messages.length <= limit) return messages
  return messages.slice(-limit)
}

const sanitizeMessages = (messages = []) => {
  return messages.map(msg => {
    const sanitizedMsg = { role: msg.role, content: msg.content }
    if (msg.tool_calls) sanitizedMsg.tool_calls = msg.tool_calls
    if (msg.tool_call_id) sanitizedMsg.tool_call_id = msg.tool_call_id
    if (msg.name) sanitizedMsg.name = msg.name
    return sanitizedMsg
  })
}

const selectSystemPrompt = (mode = "Padrão") => {
  const prompt = allPrompts.find(p => p.content.trim().startsWith(`Modo ${mode}`))
  return prompt || allPrompts[0]
}

const prepareRequestOptions = (body) => {
  const { model, stream, plugins, use_tools } = body
  const requestOptions = {
    model,
    stream,
    plugins: plugins || undefined
  }

  if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
    const filteredTools = tools.filter((tool) => use_tools.includes(tool.function.name))
    if (filteredTools.length > 0) {
      requestOptions.tools = filteredTools
      requestOptions.tool_choice = "auto"
      console.log(`[TOOL CONTROL] Usando as seguintes ferramentas: ${use_tools.join(", ")}`)
    }
  }

  return requestOptions
}

const handleStreamingResponse = async (res, { aiProvider, aiKey, messages, requestOptions }) => {
  const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  for await (const chunk of streamResponse) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`)
  }
  return res.end()
}

const executeToolCalls = async (initialResponse, messages, { aiProvider, aiKey, model }) => {
  const responseMessage = initialResponse.data.choices[0].message
  messages.push(responseMessage)

  for (const toolCall of responseMessage.tool_calls) {
    const functionName = toolCall.function.name
    const functionToCall = availableTools[functionName]
    const functionArgs = JSON.parse(toolCall.function.arguments)

    console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)

    let functionResponse
    if (functionName === "executeHttpRequest") {
      functionResponse = await functionToCall(functionArgs)
    } else {
      functionResponse = await functionToCall(...Object.values(functionArgs))
    }

    messages.push({
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify(functionResponse.data)
    })
  }

  const sanitizedMessages = sanitizeMessages(messages)
  return await ask(aiProvider, aiKey, sanitizedMessages, { model })
}

const handleError = (error, res, req) => {
  console.error(`[SEND_MESSAGE_ERROR] ${new Date().toISOString()} -`, {
    error: error.message,
    stack: error.stack,
    aiProvider: req.body.aiProvider,
    model: req.body.model
  })

  const errorMessages = {
    AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida. Verifique suas credenciais." },
    RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido. Tente novamente mais tarde." },
    API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com o serviço de IA. Tente novamente." }
  }
  const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }

  const { status, message } = errorMessages[error.message] || defaultError
  return res.status(status).json({ error: { code: error.message, message } })
}

module.exports = {
  cleanMessageHistory,
  sanitizeMessages,
  selectSystemPrompt,
  prepareRequestOptions,
  handleStreamingResponse,
  executeToolCalls,
  handleError,
}

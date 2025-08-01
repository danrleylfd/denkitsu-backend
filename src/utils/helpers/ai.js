const axios = require("axios")
const { ask } = require("../api/ai")
const { availableTools, tools: internalTools } = require("../tools")
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

const fetchMcpTools = async (mcpServerUrl) => {
  try {
    const { data: resourceList } = await axios.get(mcpServerUrl)
    if (!resourceList.resources) return []
    const toolPromises = resourceList.resources.map(async (resource) => {
      const { data: toolDefinition } = await axios.get(`${mcpServerUrl}/resources/${resource.id}`)
      return { type: "function", function: toolDefinition }
    })
    return Promise.all(toolPromises)
  } catch (error) {
    console.error(`[MCP_FETCH_ERROR] Falha ao buscar ferramentas de ${mcpServerUrl}:`, error.message)
    return []
  }
}

const prepareRequestOptions = async (body) => {
  const { model, stream, plugins, use_tools, mcp_server_url } = body
  const requestOptions = { model, stream, plugins: plugins || undefined }
  let mcpToolIds = new Set()
  let allTools = [...internalTools]
  if (mcp_server_url) {
    const mcpTools = await fetchMcpTools(mcp_server_url)
    if (mcpTools.length > 0) {
      allTools = allTools.concat(mcpTools)
      mcpTools.forEach(tool => mcpToolIds.add(tool.function.id))
    }
  }
  if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
    const filteredTools = allTools.filter((tool) => use_tools.includes(tool.function.name))
    if (filteredTools.length > 0) {
      requestOptions.tools = filteredTools
      requestOptions.tool_choice = "auto"
      console.log(`[TOOL CONTROL] Usando as seguintes ferramentas: ${use_tools.join(", ")}`)
    }
  }
  return { requestOptions, mcpToolIds }
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

const executeToolCalls = async (initialResponse, messages, { aiProvider, aiKey, model, mcpToolIds, mcp_server_url }) => {
  const responseMessage = initialResponse.data.choices[0].message
  messages.push(responseMessage)
  for (const toolCall of responseMessage.tool_calls) {
    const functionName = toolCall.function.name
    const functionArgs = JSON.parse(toolCall.function.arguments)
    let functionResponse
    if (mcpToolIds.has(functionName)) {
      console.log(`[MCP_TOOL_CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
      const { data: mcpResult } = await axios.post(`${mcp_server_url}/resources/${functionName}/execute`, functionArgs)
      functionResponse = mcpResult
    } else {
      console.log(`[INTERNAL_TOOL_CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
      const functionToCall = availableTools[functionName]
      if (functionName === "executeHttpRequest") {
        functionResponse = await functionToCall(functionArgs)
      } else {
        functionResponse = await functionToCall(...Object.values(functionArgs))
      }
    }

    messages.push({
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify(functionResponse.data || functionResponse),
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

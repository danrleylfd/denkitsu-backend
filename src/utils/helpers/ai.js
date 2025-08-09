const { encoding_for_model } = require("@dqbd/tiktoken")

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

const calculateTokens = (text, model) => {
  const fallbackModel = "text-ada-001"
  let encoder
  try {
    const modeloSeguro = model.split("/")[1] || fallbackModel
    encoder = encoding_for_model(modeloSeguro)
  } catch {
    console.warn(`Modelo "${model}" não suportado. Usando fallback: ${fallbackModel}`)
    encoder = encoding_for_model(fallbackModel)
  }
  const tokens = encoder.encode(text || "").length
  encoder.free()
  return tokens
}

module.exports = {
  cleanMessageHistory,
  sanitizeMessages,
  calculateTokens,
}

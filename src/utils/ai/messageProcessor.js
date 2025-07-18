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

module.exports = { cleanMessageHistory, sanitizeMessages }

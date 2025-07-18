const cleanMessageHistory = (messages = [], limit = 20) => {
  if (!Array.isArray(messages) || messages.length <= limit) return messages
  return messages.slice(-limit)
}

const sanitizeMessages = (messages) => messages.map(({ role, content }) => ({ role, content }))

module.exports = { cleanMessageHistory, sanitizeMessages }

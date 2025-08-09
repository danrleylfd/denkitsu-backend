const { sanitizeMessages, calculateTokens } = require("../../utils/helpers/ai")

const aiMiddleware = (req, res, next) => {
  try {
    // const limitedMessages = cleanMessageHistory(req.body.messages, 15)
    const sanitizedMessages = sanitizeMessages(req.body.messages)
    const totalTokens = sanitizedMessages.map(msg => ({
      tokens: calculateTokens(msg.content.text, req.body.model)
    })).reduce((acc, msg) => acc + (msg.tokens || 0), 0)
    req.body.messages = sanitizedMessages
    req.body.totalTokens = totalTokens
    return next()
  } catch (error) {
    console.error(`[AI_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = aiMiddleware

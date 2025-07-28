const { cleanMessageHistory, sanitizeMessages } = require("../../utils/ai/messageProcessor")

const aiMiddleware = (req, res, next) => {
  try {
    // const limitedMessages = cleanMessageHistory(req.body.messages, 15)
    const finalMessages = sanitizeMessages(req.body.messages)
    req.body.messages = finalMessages
    return next()
  } catch (error) {
    console.error(`[AI_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = aiMiddleware

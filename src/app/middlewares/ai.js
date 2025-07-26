const { cleanMessageHistory, sanitizeMessages } = require("../../utils/ai/messageProcessor")

const aiMiddleware = (req, res, next) => {
  try {
    // const limitedMessages = cleanMessageHistory(req.body.messages, 15)
    const finalMessages = sanitizeMessages(req.body.messages)
    req.body.messages = finalMessages
    return next()
  } catch (error) {
    console.error(`[AI_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "AI_MIDDLEWARE_ERROR", message: "Ocorreu um erro interno ao processar as mensagens da IA." } })
  }
}

module.exports = aiMiddleware

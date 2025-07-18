const { cleanMessageHistory, sanitizeMessages } = require("../../utils/ai/messageProcessor")

const aiMiddleware = (req, res, next) => {
  try {
    if (!req.body.messages || !Array.isArray(req.body.messages)) return next()
    // const limitedMessages = cleanMessageHistory(req.body.messages, 15)
    const finalMessages = sanitizeMessages(limitedMessages)
    req.body.messages = finalMessages
    return next()
  } catch (error) {
    console.error(`[AI_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    return res.status(500).json({
      code: "AI_MIDDLEWARE_ERROR",
      error: "Ocorreu um erro ao processar as mensagens da IA."
    })
  }
}

module.exports = aiMiddleware

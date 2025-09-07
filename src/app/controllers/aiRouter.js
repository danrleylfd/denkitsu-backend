const createAppError = require("../../utils/errors")

const aiRouter = (req, res, next) => {
  const { aiProvider = "groq", stream = false } = req.body

  const provider = aiProvider.toLowerCase()
  const streamType = stream ? "stream" : "nonstream"

  let path
  switch (provider) {
    case "groq":
    case "openrouter":
    case "custom":
      path = `/ai/chat/${provider}/${streamType}`
      break
    case "gemini":
      path = `/ai/chat/gemini/${streamType}`
      break
    default:
      return next(createAppError("O provedor de IA especificado é inválido.", 400, "INVALID_AI_PROVIDER"))
  }

  req.url = path
  return next("route")
}

module.exports = aiRouter

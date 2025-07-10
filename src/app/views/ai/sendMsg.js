const { ask } = require("../../../utils/services/ai/alt")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "openrouter", model, messages: prompts, aiKey, plugins } = req.body
    if (!model || model.trim().length < 3) throw new Error("MODEL_MISSING")
    if (!prompts || prompts.length < 1) throw new Error("PROMPTS_MISSING")
    if (!["openrouter", "groq"].includes(aiProvider)) throw new Error("INVALID_PROVIDER")
    const { status, data } = await ask(aiProvider, [...prompts], { model, plugins: plugins ? plugins : undefined }, aiKey)
    return res.status(status).json(data)
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data)
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, {
      error: error.message,
      stack: error.stack,
      aiProvider: req.body.aiProvider,
      model: req.body.model
    })
    const errorMessages = {
      MODEL_MISSING: { status: 422, message: "Por favor, selecione um modelo de IA." },
      PROMPTS_MISSING: { status: 422, message: "Por favor, envie uma mensagem." },
      INVALID_PROVIDER: { status: 400, message: "O provedor de IA selecionado não é válido." }
    }
    const defaultError = { status: 500, message: `[SEND_MESSAGE] ${new Date().toISOString()} - Internal server error` }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = sendMessage

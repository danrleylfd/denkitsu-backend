const ask = require("../../../utils/services/ai")

const sysPrompt = {
  role: "system",
  content: "O assistant deve sempre responder em pt-BR, mesmo que o usuário escreva em outro idioma."
}

const sendMessage = async (req, res) => {
  try {
    const { model, messages: prompts } = req.body
    if (!model || model.trim().length < 3) throw new Error("MODEL_MISSING")
    if (!prompts || prompts.length < 1) throw new Error("PROMPTS_MISSING")
    console.log(`MODEL ${model}`)
    console.log(`USER ${prompts[0].content}`)
    const { status, data } = await ask([sysPrompt, ...prompts], { model })
    console.log(`ASSISTANT ${data.choices[0].message.content.split("\n")[0]}...`)
    return res.status(status).json(data)
  } catch (error) {
    if (error.response) {
      console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, { status: error.response.status, data: error.response.data })
      return res.status(error.response.status).json(error.response.data)
    }
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[SEND_MESSAGE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      MODEL_MISSING: { status: 422, message: "model is required" },
      PROMPTS_MISSING: { status: 422, message: "prompts is required" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = sendMessage

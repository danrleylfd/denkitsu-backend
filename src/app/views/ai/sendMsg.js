const { ask } = require("../../../utils/services/ai/alt")
const { availableTools, tools } = require("../../../utils/tools")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: prompts, aiKey, plugins } = req.body
    if (!model || model.trim().length < 3) throw new Error("MODEL_MISSING")
    if (!prompts || prompts.length < 1) throw new Error("PROMPTS_MISSING")
    if (!["openrouter", "groq"].includes(aiProvider)) throw new Error("INVALID_PROVIDER")
    const { status, data } = await ask(aiProvider, aiKey, [...prompts], {
      model,
      plugins: plugins ? plugins : undefined,
      tools,
      tool_choice: "auto"
    })
    const resMsg = data.choices[0].message
    if (resMsg.tool_calls) {
      prompts.push(resMsg)
      for (const toolCall of resMsg.tool_calls) {
        const functionName = toolCall.function.name
        const functionToCall = availableTools[functionName]
        const functionArgs = JSON.parse(toolCall.function.arguments)
        console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
        const functionResponse = await functionToCall(functionArgs.location)
        prompts.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse.data),
        })
      }
      const finalResponse = await ask(aiProvider, aiKey, prompts, { model })
      return res.status(finalResponse.status).json(finalResponse.data)
    }
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
      INVALID_PROVIDER: { status: 400, message: "O provedor de IA selecionado não é válido." },
      API_KEY_MISSING: { status: 401, message: "Chave de API não fornecida. Verifique suas credenciais." },
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida. Verifique suas credenciais." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido. Tente novamente mais tarde." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com o serviço de IA. Tente novamente." }
    }
    const defaultError = { status: 500, message: `[SEND_MESSAGE] ${new Date().toISOString()} - Internal server error` }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = sendMessage

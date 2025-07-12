const { ask } = require("../../../utils/services/ai/alt")
const { availableTools, tools } = require("../../../utils/tools")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: prompts, aiKey, plugins, use_tools } = req.body
    if (!model || model.trim().length < 3) throw new Error("MODEL_MISSING")
    if (!prompts || prompts.length < 1) throw new Error("PROMPTS_MISSING")
    if (!["openrouter", "groq"].includes(aiProvider)) throw new Error("INVALID_PROVIDER")
    const cleanedPrompts = prompts.map(msg => {
      const { reasoning, _contentBuffer, _reasoningBuffer, id, ...validMsg } = msg
      return validMsg
    })
    const requestOptions = {
      model,
      plugins: plugins ? plugins : undefined,
    }
    if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
      const filteredTools = tools.filter(tool => use_tools.includes(tool.function.name))
      if (filteredTools.length > 0) {
        requestOptions.tools = filteredTools
        requestOptions.tool_choice = "auto"
        console.log(`[TOOL CONTROL] Usando as seguintes ferramentas: ${use_tools.join(', ')}`)
      }
    }
    const { status, data } = await ask(aiProvider, aiKey, [...cleanedPrompts], requestOptions)
    const resMsg = data.choices[0].message
    if (resMsg.tool_calls) {
      const toolPrompts = [...cleanedPrompts, resMsg]
      for (const toolCall of resMsg.tool_calls) {
        const functionName = toolCall.function.name
        const functionToCall = availableTools[functionName]
        const functionArgs = JSON.parse(toolCall.function.arguments)
        console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
        const functionResponse = await functionToCall(...Object.values(functionArgs))
        toolPrompts.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse.data),
        })
      }
      const finalResponse = await ask(aiProvider, aiKey, toolPrompts, { model })
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

const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  cleanToolCallSyntax,
  extractReasoning,
  getSystemPrompt,
  buildToolOptions,
  processToolCalls
} = require("./chatHelpers")

const sendWithoutStream = async (req, res) => {
  try {
    const { aiProvider, model, messages: userPrompts, aiKey, use_tools, mode } = req.body
    const { userID } = req

    const systemPrompt = await getSystemPrompt(mode, userID)
    let messages = [systemPrompt, ...userPrompts]
    const toolOptions = await buildToolOptions(aiProvider, use_tools, userID)
    const requestOptions = { model, stream: false, ...toolOptions }

    const { data } = await ask(aiProvider, aiKey, messages, requestOptions)
    let responseMessage = data.choices[0].message
    responseMessage.content = cleanToolCallSyntax(responseMessage.content)

    if (responseMessage.tool_calls) {
      const initialReasoning = responseMessage.reasoning || ""
      messages.push(responseMessage)
      const toolResultMessages = await processToolCalls(responseMessage.tool_calls, userID)
      messages.push(...toolResultMessages)
      const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messages), { model, stream: false })
      const finalMessage = finalResponse.data.choices[0].message
      finalMessage.content = cleanToolCallSyntax(finalMessage.content)
      const { content, reasoning: finalExtractedReasoning } = extractReasoning(finalMessage.content)
      finalMessage.content = content
      finalMessage.reasoning = `${initialReasoning}\n\n${finalExtractedReasoning}`.trim()
      return res.status(200).json({ ...finalResponse.data, tool_calls: responseMessage.tool_calls || [] })
    }

    const { content, reasoning } = extractReasoning(responseMessage.content)
    responseMessage.content = content
    responseMessage.reasoning = reasoning
    return res.status(200).json({ ...data, tool_calls: responseMessage.tool_calls || [] })
  } catch (error) {
    console.error(`[SEND_MESSAGE_NO_STREAM] ${new Date().toISOString()} -`, {
      error: error.message,
      stack: error.stack,
      aiProvider: req.body.aiProvider,
      model: req.body.model
    })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida. Verifique suas credenciais." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido. Tente novamente mais tarde." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com o serviço de IA. Tente novamente." },
      TOOL_ERROR: { status: 500, message: "Falha ao executar ferramentas." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = sendWithoutStream

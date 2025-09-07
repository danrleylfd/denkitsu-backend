const { cleanToolCallSyntax, extractReasoning, processToolCalls, getSystemPrompt } = require("./chatHelpers")
const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")

const finalizeAndSendResponse = async (req, res) => {
  const { aiProvider, aiKey, model, customApiUrl, messages: userPrompts } = req.body
  const { user, userID } = req
  let data = res.locals.primaryResponse

  if (!data || !data.choices || data.choices.length === 0) {
    throw new Error("A resposta da API de IA não contém 'choices' válidos.")
  }

  let responseMessage = data.choices[0].message

  // VERIFICA SE O ROTEADOR FOI ATIVADO
  const routerToolCall = responseMessage.tool_calls?.find(tc => tc.function.name === "selectAgentTool")

  if (routerToolCall) {
    console.log("[FINALIZE_NON_STREAM] Roteador detectado. Executando a segunda chamada internamente.")
    const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)
    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    const resultData = JSON.parse(routerToolCallResult.content)

    if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
      const newAgentName = resultData.agent
      const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
      const userOnlyMessages = userPrompts.filter(msg => msg.role !== "system")
      const messagesForNextStep = [newSystemPrompt, ...userOnlyMessages]

      // Executa a segunda chamada para a IA, agora com o agente correto
      const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { model, stream: false, customApiUrl })
      data = finalResponse.data // Substitui a resposta do roteador pela resposta final
      responseMessage = data.choices[0].message
    }
  }

  // A partir daqui, a lógica processa a RESPOSTA FINAL (seja do roteador ou da primeira chamada)
  if (responseMessage.tool_calls && responseMessage.tool_calls.length === 1 && responseMessage.tool_calls[0].function.name === "ttsTool") {
    const ttsCall = responseMessage.tool_calls[0]
    const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)
    const ttsResult = toolResultMessages.find(r => r.tool_call_id === ttsCall.id)

    if (ttsResult) {
      const audioData = JSON.parse(ttsResult.content)
      const finalMessage = {
        role: "assistant",
        content: audioData.inputText,
        audio: { data: audioData.audio, format: audioData.format || "wav" }
      }
      return res.status(200).json({
        id: data.id,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: req.body.model,
        choices: [{ index: 0, message: finalMessage, finish_reason: "stop" }],
        tool_calls: responseMessage.tool_calls || []
      })
    }
  }

  const { content, reasoning } = extractReasoning(cleanToolCallSyntax(responseMessage.content))
  responseMessage.content = content
  responseMessage.reasoning = responseMessage.reasoning || reasoning

  return res.status(200).json({ ...data, tool_calls: data.tool_calls || [] })
}

module.exports = finalizeAndSendResponse

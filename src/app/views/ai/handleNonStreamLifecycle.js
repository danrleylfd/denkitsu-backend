const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const { processToolCalls, getSystemPrompt, cleanToolCallSyntax, extractReasoning } = require("./chatHelpers")

const handleNonStreamingLifecycle = async (req, res, next) => {
  const { aiProvider, aiKey } = req.body
  const { user, userID, aiRequestPayload } = req
  const { initialMessages, originalUserMessages, options: requestOptions } = aiRequestPayload

  try {
    // 1. Primeira chamada à IA
    const { data: firstResponseData } = await ask(aiProvider, aiKey, initialMessages, { ...requestOptions, stream: false })
    let responseMessage = firstResponseData.choices[0].message

    // 2. Se não houver tool calls, extrai o raciocínio e finaliza.
    if (!responseMessage.tool_calls) {
      const { content, reasoning } = extractReasoning(cleanToolCallSyntax(responseMessage.content))
      responseMessage.content = content
      responseMessage.reasoning = reasoning
      return res.status(200).json(firstResponseData)
    }

    // ADICIONADO: Extrai e armazena o raciocínio da primeira chamada
    const { reasoning: initialReasoning } = extractReasoning(cleanToolCallSyntax(responseMessage.content))

    // 3. Se houver, executa as ferramentas
    const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)

    let messagesForNextStep
    let finalResponseData

    // 4. Lógica especial para o Agente Roteador
    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    if (routerToolCallResult) {
      const resultData = JSON.parse(routerToolCallResult.content)
      if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
        const newAgentName = resultData.agent
        const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
        messagesForNextStep = [newSystemPrompt, ...originalUserMessages.filter(m => m.role !== "system")]

        // 5. Segunda chamada à IA com o novo agente
        const { data } = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: false })
        finalResponseData = data
        finalResponseData.routingInfo = { routedTo: newAgentName }
      }
    } else {
      // 6. Para ferramentas normais, anexa os resultados e faz a segunda chamada
      messagesForNextStep = [...initialMessages, responseMessage, ...toolResultMessages]
      const { data } = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: false })
      finalResponseData = data
    }

    // 7. Processa a resposta final e envia
    let finalMessage = finalResponseData.choices[0].message
    // MODIFICADO: Extrai o raciocínio da segunda chamada
    const { content, reasoning: finalExtractedReasoning } = extractReasoning(cleanToolCallSyntax(finalMessage.content))
    finalMessage.content = content
    // MODIFICADO: Concatena o raciocínio inicial com o final
    finalMessage.reasoning = `${initialReasoning}\n\n${finalExtractedReasoning}`.trim()
    finalResponseData.tool_calls = responseMessage.tool_calls

    return res.status(200).json(finalResponseData)

  } catch (error) {
    next(error)
  }
}

module.exports = handleNonStreamingLifecycle

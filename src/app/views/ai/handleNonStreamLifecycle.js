// Arquivo: Backend/src/app/views/ai/handleNonStreamLifecycle.js

const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const { processToolCalls, getSystemPrompt, cleanToolCallSyntax, extractReasoning } = require("./chatHelpers")

const handleNonStreamingLifecycle = async (req, res, next) => {
  const { aiProvider, aiKey } = req.body
  const { user, userID, aiRequestPayload } = req
  const { initialMessages, originalUserMessages, options: requestOptions } = aiRequestPayload

  try {
    const { data: firstResponseData } = await ask(aiProvider, aiKey, initialMessages, { ...requestOptions, stream: false })
    const responseMessage = firstResponseData.choices[0].message

    if (!responseMessage.tool_calls) {
      // MODIFICADO: Captura o reasoning de ambas as fontes
      const reasoningFromField = responseMessage.reasoning || ""
      const { content, reasoning: reasoningFromContent } = extractReasoning(cleanToolCallSyntax(responseMessage.content))
      const finalReasoning = (reasoningFromField + "\n" + reasoningFromContent).trim()

      const finalMessage = { ...responseMessage, content, reasoning: finalReasoning }
      const finalData = { ...firstResponseData, choices: [{ ...firstResponseData.choices[0], message: finalMessage }] }

      return res.status(200).json(finalData)
    }

    // MODIFICADO: Captura o reasoning inicial de ambas as fontes
    const initialReasoningFromField = responseMessage.reasoning || ""
    const { reasoning: initialReasoningFromContent } = extractReasoning(cleanToolCallSyntax(responseMessage.content))
    const initialReasoning = (initialReasoningFromField + "\n" + initialReasoningFromContent).trim()

    const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)

    let messagesForNextStep
    let finalResponseData

    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    if (routerToolCallResult) {
      const resultData = JSON.parse(routerToolCallResult.content)
      if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
        const newAgentName = resultData.agent
        const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
        messagesForNextStep = [newSystemPrompt, ...originalUserMessages.filter(m => m.role !== "system")]

        const { data } = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: false })
        finalResponseData = data
        finalResponseData.routingInfo = { routedTo: newAgentName }
      }
    } else {
      messagesForNextStep = [...initialMessages, responseMessage, ...toolResultMessages]
      const { data } = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: false })
      finalResponseData = data
    }

    const finalMessageFromAI = finalResponseData.choices[0].message

    // MODIFICADO: Captura o reasoning final de ambas as fontes
    const finalReasoningFromField = finalMessageFromAI.reasoning || ""
    const { content, reasoning: finalReasoningFromContent } = extractReasoning(cleanToolCallSyntax(finalMessageFromAI.content))
    const finalExtractedReasoning = (finalReasoningFromField + "\n" + finalReasoningFromContent).trim()

    const finalMessageWithReasoning = {
      ...finalMessageFromAI,
      content,
      reasoning: `${initialReasoning}\n...\n${finalExtractedReasoning}`.trim()
    }

    const finalData = {
      ...finalResponseData,
      choices: [{ ...finalResponseData.choices[0], message: finalMessageWithReasoning }],
      tool_calls: responseMessage.tool_calls
    }

    return res.status(200).json(finalData)

  } catch (error) {
    next(error)
  }
}

module.exports = handleNonStreamingLifecycle

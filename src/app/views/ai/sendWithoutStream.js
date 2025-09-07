const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  cleanToolCallSyntax,
  extractReasoning,
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
} = require("./chatHelpers")
const { createAIClientFactory } = require("../../../utils/api/ai")

const handleOpenAINonStream = async (req, res, next) => {
  const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode, customApiUrl } = req.body
  const { userID, user } = req
  try {
    const systemPrompt = await getSystemPrompt(mode, userID)
    const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
    const requestOptions = { model, stream: false, customApiUrl, ...toolOptions }

    let messagesForFirstCall = [systemPrompt, ...userPrompts]
    if (mode === "Roteador") {
      const textOnlyUserPrompts = userPrompts.map((msg) => {
        if (Array.isArray(msg.content)) {
          const textContent = msg.content.find((part) => part.type === "text")
          return { ...msg, content: textContent ? textContent.content : "" }
        }
        return msg
      })
      messagesForFirstCall = [systemPrompt, ...textOnlyUserPrompts]
    }

    const { data } = await ask(aiProvider, aiKey, messagesForFirstCall, requestOptions)
    let responseMessage = data.choices[0].message
    responseMessage.content = cleanToolCallSyntax(responseMessage.content)

    if (responseMessage.tool_calls) {
      const ttsCall = responseMessage.tool_calls.find(c => c.function.name === "ttsTool")
      const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)
      if (ttsCall && responseMessage.tool_calls.length === 1) {
        const ttsResult = toolResultMessages.find(r => r.tool_call_id === ttsCall.id)
        if (ttsResult) {
          const audioData = JSON.parse(ttsResult.content)
          const finalMessage = {
            role: "assistant",
            content: audioData.inputText,
            audio: {
              data: audioData.audio,
              format: audioData.format || "wav"
            }
          }
          return res.status(200).json({
            id: data.id,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{ index: 0, message: finalMessage, finish_reason: "stop" }],
            tool_calls: responseMessage.tool_calls || []
          })
        }
      }
      const routerToolCall = responseMessage.tool_calls.find(tc => tc.function.name === "selectAgentTool")
      if (routerToolCall) {
        const args = JSON.parse(routerToolCall.function.arguments)
        return res.status(200).json({
          next_action: { type: "SWITCH_AGENT", agent: args.agentName },
          original_message: responseMessage
        })
      }
      const initialReasoning = responseMessage.reasoning || ""
      const messagesWithToolResults = [...messagesForFirstCall, responseMessage, ...toolResultMessages]
      const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messagesWithToolResults), { model, stream: false, customApiUrl })
      const finalMessage = finalResponse.data.choices[0].message
      finalMessage.content = cleanToolCallSyntax(finalMessage.content)
      const { content, reasoning: finalExtractedReasoning } = extractReasoning(finalMessage.content)
      finalMessage.content = content
      finalMessage.reasoning = `${initialReasoning}\n\n${finalExtractedReasoning}`.trim()
      return res.status(200).json({ ...finalResponse.data, tool_calls: responseMessage.tool_calls || [] })
    }
    const existingReasoning = responseMessage.reasoning || ""
    const { content, reasoning: extractedReasoning } = extractReasoning(responseMessage.content)
    responseMessage.content = content
    responseMessage.reasoning = existingReasoning || extractedReasoning
    return res.status(200).json({ ...data, tool_calls: responseMessage.tool_calls || [] })
  } catch(error) {
    next(error)
  }
}

module.exports = {
  handleOpenAINonStream
}

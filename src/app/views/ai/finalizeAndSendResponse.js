const { cleanToolCallSyntax, extractReasoning } = require("./chatHelpers")
const { processToolCalls } = require("./chatHelpers")

const finalizeAndSendResponse = async (req, res) => {
  const { data } = res.locals.primaryResponse
  const responseMessage = data.choices[0].message
  const { user } = req
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
  const routerToolCall = responseMessage.tool_calls?.find(tc => tc.function.name === "selectAgentTool")
  if (routerToolCall) {
    const args = JSON.parse(routerToolCall.function.arguments)
    return res.status(200).json({
      next_action: { type: "SWITCH_AGENT", agent: args.agentName },
      original_message: responseMessage
    })
  }
  if (!res.locals.finalResponse) {
    const { content, reasoning } = extractReasoning(cleanToolCallSyntax(responseMessage.content))
    responseMessage.content = content
    responseMessage.reasoning = responseMessage.reasoning || reasoning
  }
  return res.status(200).json({ ...data, tool_calls: data.tool_calls || [] })
}

module.exports = finalizeAndSendResponse

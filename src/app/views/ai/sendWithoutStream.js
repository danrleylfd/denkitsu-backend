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
  const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode } = req.body
  const { userID } = req
  const systemPrompt = await getSystemPrompt(mode, userID)
  let messages = [systemPrompt, ...userPrompts]
  const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
  const requestOptions = { model, stream: false, ...toolOptions }
  const { data } = await ask(aiProvider, aiKey, messages, requestOptions)
  let responseMessage = data.choices[0].message
  responseMessage.content = cleanToolCallSyntax(responseMessage.content)
  if (responseMessage.tool_calls) {
    const routerToolCall = responseMessage.tool_calls.find(tc => tc.function.name === "selectAgentTool")
    if (routerToolCall) {
      const args = JSON.parse(routerToolCall.function.arguments)
      return res.status(200).json({
        next_action: { type: "SWITCH_AGENT", agent: args.agentName },
        original_message: responseMessage
      })
    }
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
  const existingReasoning = responseMessage.reasoning || ""
  const { content, reasoning: extractedReasoning } = extractReasoning(responseMessage.content)
  responseMessage.content = content
  responseMessage.reasoning = existingReasoning || extractedReasoning
  return res.status(200).json({ ...data, tool_calls: responseMessage.tool_calls || [] })
}

module.exports = sendWithoutStream

const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  cleanToolCallSyntax,
  extractReasoning,
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  transformToGemini,
  transformFromGemini
} = require("./chatHelpers")
const { createAIClientFactory } = require("../../../utils/api/ai")

const handleGeminiNonStream = async (req, res, next) => {
  const { model: modelName, messages: userPrompts, aiKey, use_tools = [], mode, customProviderUrl } = req.body
  const { userID, user } = req
  const systemPrompt = await getSystemPrompt(mode, userID)

  const allMessages = [...userPrompts]
  const initialHistory = allMessages.slice(0, -1)
  const lastMessage = allMessages[allMessages.length - 1]

  const toolOptions = await buildToolOptions("gemini", use_tools, userID, mode)
  const geminiClient = createAIClientFactory("gemini", aiKey)
  const geminiModel = geminiClient.getGenerativeModel({
    model: modelName || "gemini-1.5-flash",
    systemInstruction: {
      parts: [{ text: systemPrompt.content }]
    },
    ...toolOptions
  })

  const chat = geminiModel.startChat({
    history: transformToGemini(initialHistory)
  })

  const lastMessageTransformed = transformToGemini([lastMessage])[0]
  const result1 = await chat.sendMessage(lastMessageTransformed.parts)
  let response1 = result1.response

  const functionCalls = response1.candidates[0].content.parts.filter(p => p.functionCall)

  if (functionCalls.length > 0) {
    const openAIToolCalls = transformFromGemini(response1).tool_calls

    const routerToolCall = openAIToolCalls.find(tc => tc.function.name === "selectAgentTool")
    if (routerToolCall) {
      const args = JSON.parse(routerToolCall.function.arguments)
      return res.status(200).json({
        next_action: { type: "SWITCH_AGENT", agent: args.agentName },
        original_message: transformFromGemini(response1)
      })
    }

    const toolResultMessages = await processToolCalls(openAIToolCalls, user)
    const functionResponseParts = toolResultMessages.map(toolMsg => ({
      functionResponse: {
        name: toolMsg.name,
        response: JSON.parse(toolMsg.content)
      }
    }))

    const result2 = await chat.sendMessage(functionResponseParts)
    const finalResponse = transformFromGemini(result2.response)
    return res.status(200).json({ choices: [{ message: finalResponse }] })
  }

  const finalResponse = transformFromGemini(response1)
  return res.status(200).json({ choices: [{ message: finalResponse }] })
}

const handleOpenAINonStream = async (req, res) => {
  const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode, customApiUrl } = req.body
  const { userID, user } = req
  const systemPrompt = await getSystemPrompt(mode, userID)
  let messages = [systemPrompt, ...userPrompts]
  const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
  const requestOptions = { model, stream: false, customApiUrl, ...toolOptions }

  const { data } = await ask(aiProvider, aiKey, messages, requestOptions)
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
    messages.push(responseMessage)
    messages.push(...toolResultMessages)
    const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messages), { model, stream: false, customApiUrl, ...toolOptions })
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

module.exports = {
  handleGeminiNonStream,
  handleOpenAINonStream
}

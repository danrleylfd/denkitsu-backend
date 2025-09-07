const { ask } = require("../../utils/api/ai")
const { sanitizeMessages } = require("../../utils/helpers/ai")
const { getSystemPrompt, buildToolOptions, processToolCalls, cleanToolCallSyntax, extractReasoning } = require("../views/ai/chatHelpers")

const prepareInitialAIRequest = async (req, res, next) => {
  const { model, messages: userPrompts, use_tools = [], mode } = req.body
  const { userID } = req

  const systemPrompt = await getSystemPrompt(mode, userID)
  const messages = [systemPrompt, ...userPrompts]
  const toolOptions = await buildToolOptions(req.body.aiProvider, use_tools, userID, mode)
  const requestOptions = { model, stream: req.body.stream, customApiUrl: req.body.customApiUrl, ...toolOptions }

  req.aiRequestPayload = { messages, options: requestOptions }
  next()
}

const makePrimaryAIRequest = async (req, res, next) => {
  const { aiProvider, aiKey } = req.body
  const { messages, options } = req.aiRequestPayload
  const { data } = await ask(aiProvider, aiKey, messages, { ...options, stream: false })
  res.locals.primaryResponse = data
  res.locals.rawMessages = messages
  next()
}

const handleToolCalls = async (req, res, next) => {
  const { aiProvider, aiKey, model, customApiUrl } = req.body
  const { user } = req
  const { primaryResponse, rawMessages } = res.locals
  const responseMessage = primaryResponse.choices[0].message

  if (!responseMessage.tool_calls) return next()

  responseMessage.content = cleanToolCallSyntax(responseMessage.content)
  const { reasoning: initialReasoning } = extractReasoning(responseMessage.content)

  const toolResultMessages = await processToolCalls(responseMessage.tool_calls, user)
  const messagesWithToolResults = [...rawMessages, responseMessage, ...toolResultMessages]

  const finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(messagesWithToolResults), { model, stream: false, customApiUrl })
  const finalMessage = finalResponse.data.choices[0].message

  const { content, reasoning: finalExtractedReasoning } = extractReasoning(cleanToolCallSyntax(finalMessage.content))
  finalMessage.content = content
  finalMessage.reasoning = `${initialReasoning || ""}\n\n${finalExtractedReasoning}`.trim()

  finalResponse.data.tool_calls = responseMessage.tool_calls || []
  res.locals.primaryResponse = finalResponse.data
  next()
}

module.exports = {
  prepareInitialAIRequest,
  makePrimaryAIRequest,
  handleToolCalls
}

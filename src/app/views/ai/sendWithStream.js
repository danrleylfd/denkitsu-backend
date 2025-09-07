const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning
} = require("./chatHelpers")

const handleGeminiStream = async (req, res, next) => {
  const { model, messages: userPrompts, aiKey, use_tools = [], mode, customProviderUrl } = req.body
  const { userID, user } = req

  const systemPrompt = await getSystemPrompt(mode, userID)
  let messages = [systemPrompt, ...userPrompts]
  const toolOptions = await buildToolOptions("gemini", use_tools, userID, mode)
  const requestOptions = { model, stream: true, customProviderUrl, ...toolOptions }

  const streamResult1 = await ask("gemini", aiKey, messages, requestOptions)

  let aggregatedToolCalls = []
  for await (const chunk of streamResult1.stream) {
    const text = chunk.text()
    if (text) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`)
    }
    if (chunk.functionCalls) {
      chunk.functionCalls().forEach((fc, i) => {
        const toolCall = {
          id: `call_${Date.now()}_${i}`,
          type: "function",
          function: { name: fc.name, arguments: JSON.stringify(fc.args) }
        }
        aggregatedToolCalls.push(toolCall)
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: i, ...toolCall }] } }] })}\n\n`)
      })
    }
  }

  if (aggregatedToolCalls.length === 0) return res.end()

  const routerToolCall = aggregatedToolCalls.find(tc => tc.function.name === "selectAgentTool")
  if (routerToolCall) {
    const args = JSON.parse(routerToolCall.function.arguments)
    const newAgentName = args.agentName
    const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
    const newMessages = [newSystemPrompt, ...userPrompts]

    const switchNotification = { choices: [{ delta: { reasoning: `<think>Roteador selecionou o Agente ${newAgentName}. Trocando contexto e continuando o fluxo.</think>` } }] }
    res.write(`data: ${JSON.stringify(switchNotification)}\n\n`)

    const finalStreamResponse = await ask("gemini", aiKey, sanitizeMessages(newMessages), requestOptions)
    for await (const chunk of finalStreamResponse.stream) {
      if (chunk.text()) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk.text() } }] })}\n\n`)
      }
    }
    return res.end()
  }

  messages.push({ role: "assistant", tool_calls: aggregatedToolCalls })
  const toolResultMessages = await processToolCalls(aggregatedToolCalls, user)
  messages.push(...toolResultMessages)

  const finalStreamResponse = await ask("gemini", aiKey, sanitizeMessages(messages), requestOptions)
  for await (const chunk of finalStreamResponse.stream) {
    if (chunk.text()) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk.text() } }] })}\n\n`)
    }
  }

  return res.end()
}


const handleOpenAIStream = async (req, res, next) => {
  const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode, customApiUrl } = req.body
  const { userID, user } = req
  const systemPrompt = await getSystemPrompt(mode, userID)
  let messages = [systemPrompt, ...userPrompts]
  const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
  const requestOptions = { model, stream: true, customApiUrl, ...toolOptions }

  const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)
  let aggregatedToolCalls = []
  let hasToolCall = false
  let initialReasoningSent = false

  for await (const chunk of streamResponse) {
    const delta = chunk.choices[0]?.delta
    if (!delta) continue
    if (delta.tool_calls) {
      hasToolCall = true
      delta.tool_calls.forEach(toolCallChunk => {
        const existingCall = aggregatedToolCalls[toolCallChunk.index]
        if (!existingCall) aggregatedToolCalls[toolCallChunk.index] = { ...toolCallChunk.function, id: toolCallChunk.id, index: toolCallChunk.index }
        else if (toolCallChunk.function?.arguments) existingCall.arguments += toolCallChunk.function.arguments
      })
      res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }
    if (delta.content || delta.reasoning) {
      for await (const processedChunk of processStreamAndExtractReasoning([chunk])) {
        if (processedChunk.choices[0]?.delta?.reasoning) initialReasoningSent = true
        res.write(`data: ${JSON.stringify(processedChunk)}\n\n`)
      }
    }
  }

  if (!hasToolCall) return res.end()

  const finalToolCalls = aggregatedToolCalls.map(call => ({
    id: call.id,
    type: "function",
    function: { name: call.name, arguments: call.arguments }
  }))
  messages.push({ role: "assistant", tool_calls: finalToolCalls })

  for (const toolCall of finalToolCalls) {
    const statusUpdate = {
      choices: [{ delta: { tool_calls: [{ index: toolCall.index, function: { name: toolCall.function.name, arguments: "" } }] } }]
    }
    res.write(`data: ${JSON.stringify(statusUpdate)}\n\n`)
  }

  const toolResultMessages = await processToolCalls(finalToolCalls, user)
  const ttsCall = finalToolCalls.find(c => c.function.name === "ttsTool")
  if (ttsCall && finalToolCalls.length === 1) {
    const ttsResult = toolResultMessages.find(r => r.tool_call_id === ttsCall.id)
    if (ttsResult) {
      const audioData = JSON.parse(ttsResult.content)
      const finalChunk = {
        choices: [{
          delta: {
            role: "assistant",
            content: audioData.inputText,
            audio: {
              data: audioData.audio,
              format: audioData.format || "wav"
            }
          }
        }]
      }
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
      return res.end()
    }
  }

  const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
  if (routerToolCallResult) {
    const resultData = JSON.parse(routerToolCallResult.content)
    if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
      const newAgentName = resultData.agent
      const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
      messages = [newSystemPrompt, ...userPrompts]
      const switchNotification = {
        choices: [{ delta: { reasoning: `<think>Roteador selecionou o Agente ${newAgentName}. Trocando contexto e continuando o fluxo.</think>` } }]
      }
      res.write(`data: ${JSON.stringify(switchNotification)}\n\n`)
    }
  } else {
    messages.push(...toolResultMessages)
  }

  if (initialReasoningSent) res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning: "\n\n...\n\n" } }] })}\n\n`)

  const secondCallOptions = { model, stream: true, customApiUrl, ...requestOptions }
  const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)
  const finalProcessedStream = processStreamAndExtractReasoning(finalResponseStream)

  for await (const finalChunk of finalProcessedStream) {
    res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
  }

  return res.end()
}

const sendWithStream = async (req, res, next) => {
  try {
    const { aiProvider } = req.body

    if (aiProvider === "gemini") {
      await handleGeminiStream(req, res, next)
    } else {
      await handleOpenAIStream(req, res, next)
    }
  } catch (error) {
    next(error)
    if (res.headersSent) {
      console.error(`[STREAM_ERROR] Erro durante o streaming, encerrando conexão: ${error.message}`)
      res.end()
    }
  }
}

module.exports = {
  handleGeminiStream,
  handleOpenAIStream
}

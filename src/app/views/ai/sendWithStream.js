const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning
} = require("./chatHelpers")

const sendWithStream = async (req, res) => {
  try {
    const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode } = req.body
    const { userID } = req
    const systemPrompt = await getSystemPrompt(mode, userID)
    let messages = [systemPrompt, ...userPrompts]
    const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
    const requestOptions = { model, stream: true, ...toolOptions }
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
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
    const toolResultMessages = await processToolCalls(finalToolCalls, userID)
    messages.push(...toolResultMessages)
    if (initialReasoningSent) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning: "\n\n...\n\n" } }] })}\n\n`)
    }
    const secondCallOptions = { model, stream: true }
    const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)
    const finalProcessedStream = processStreamAndExtractReasoning(finalResponseStream)
    for await (const finalChunk of finalProcessedStream) {
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
    }
    return res.end()
  } catch (error) {
    console.error(`[SEND_MESSAGE_STREAM] ${new Date().toISOString()} -`, {
      error: error.message,
      stack: error.stack,
      aiProvider: req.body.aiProvider,
      model: req.body.model
    })
    // Em um stream, não podemos mais enviar um status JSON. A conexão já está aberta.
    // O melhor a fazer é logar e encerrar a conexão. O frontend detectará o fechamento.
    if (!res.headersSent) {
      res.status(500).json({ error: { code: "STREAM_ERROR", message: "Ocorreu um erro interno no servidor durante o streaming." } })
    } else {
      res.end()
    }
  }
}

module.exports = sendWithStream

const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning
} = require("./chatHelpers")

const sendWithStream = async (req, res, next) => {
  try {
    const { aiProvider, model, messages: userPrompts, aiKey, use_tools = [], mode } = req.body
    const { userID } = req
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    const systemPrompt = await getSystemPrompt(mode, userID)
    let messages = [systemPrompt, ...userPrompts]
    const toolOptions = await buildToolOptions(aiProvider, use_tools, userID, mode)
    const requestOptions = { model, stream: true, ...toolOptions }
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
    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    if (routerToolCallResult) {
      const resultData = JSON.parse(routerToolCallResult.content)
      if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
        const newAgentName = resultData.agent
        const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
        messages = [newSystemPrompt, ...userPrompts] // Reinicia o histórico com o novo prompt de sistema
        const switchNotification = {
          choices: [{ delta: { reasoning: `<think>Roteador selecionou o Agente ${newAgentName}. Trocando contexto e continuando o fluxo.</think>` } }]
        }
        res.write(`data: ${JSON.stringify(switchNotification)}\n\n`)
      }
    } else messages.push(...toolResultMessages)
    if (initialReasoningSent) res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning: "\n\n...\n\n" } }] })}\n\n`)
    const secondCallOptions = { model, stream: true }
    const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messages), secondCallOptions)
    const finalProcessedStream = processStreamAndExtractReasoning(finalResponseStream)
    for await (const finalChunk of finalProcessedStream) {
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
    }
    return res.end()
  } catch (error) {
    next(error)
    if (res.headersSent) {
      console.error(`[STREAM_ERROR] Erro durante o streaming, encerrando conexão: ${error.message}`)
      res.end()
    }
  }
}

module.exports = sendWithStream

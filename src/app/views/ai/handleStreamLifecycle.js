// Arquivo: Backend/src/app/views/ai/handleStreamLifecycle.js

const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const { processToolCalls, processStreamAndExtractReasoning, getSystemPrompt } = require("./chatHelpers")

const handleStreamingLifecycle = async (req, res) => {
  const { aiProvider, aiKey } = req.body
  const { user, userID, aiRequestPayload } = req
  const { initialMessages, originalUserMessages, options: requestOptions } = aiRequestPayload

  const writeEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    // 1. Primeira chamada à IA (sempre com stream)
    const streamResponse = await ask(aiProvider, aiKey, initialMessages, { ...requestOptions, stream: true })

    let aggregatedToolCalls = []
    let hasToolCall = false

    // 2. Processa o primeiro stream
    for await (const chunk of streamResponse) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue

      if (delta.tool_calls) {
        hasToolCall = true
        delta.tool_calls.forEach(toolCallChunk => {
          const existingCall = aggregatedToolCalls[toolCallChunk.index]
          if (!existingCall) {
            aggregatedToolCalls[toolCallChunk.index] = { ...toolCallChunk.function, id: toolCallChunk.id, index: toolCallChunk.index }
          } else if (toolCallChunk.function?.arguments) {
            existingCall.arguments += toolCallChunk.function.arguments
          }
        })
      }
      // Repassa os chunks brutos para o frontend
      writeEvent(chunk)
    }

    // 3. Se não houve chamada de ferramenta, o trabalho termina aqui
    if (!hasToolCall) return res.end()

    // 4. Se houve, formata as chamadas e executa as ferramentas
    const finalToolCalls = aggregatedToolCalls.map(call => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: call.arguments }
    }))

    // Notifica o frontend que as ferramentas estão sendo executadas
    writeEvent({ type: "TOOL_EXECUTION_START", tool_calls: finalToolCalls })

    const toolResultMessages = await processToolCalls(finalToolCalls, user)

    let messagesForNextStep

    // 5. Lógica especial para o Agente Roteador
    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    if (routerToolCallResult) {
      const resultData = JSON.parse(routerToolCallResult.content)
      if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
        const newAgentName = resultData.agent
        const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
        // Usa as mensagens originais (com imagens) para a próxima etapa
        messagesForNextStep = [newSystemPrompt, ...originalUserMessages.filter(m => m.role !== "system")]
        writeEvent({ type: "AGENT_SWITCH", agent: newAgentName })
      }
    } else {
      // Para ferramentas normais, apenas anexa os resultados
      messagesForNextStep = [...initialMessages, { role: "assistant", tool_calls: finalToolCalls }, ...toolResultMessages]
    }

    // 6. Segunda chamada à IA com os resultados das ferramentas
    const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: true })

    // 7. Processa o segundo stream e repassa para o cliente
    for await (const finalChunk of processStreamAndExtractReasoning(finalResponseStream)) {
      writeEvent(finalChunk)
    }

  } catch (error) {
    console.error(`[STREAM_LIFECYCLE_ERROR] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    writeEvent({ type: "ERROR", error: { message: error.message, code: error.errorCode || "STREAM_ERROR" } })
  } finally {
    res.end()
  }
}

module.exports = handleStreamingLifecycle

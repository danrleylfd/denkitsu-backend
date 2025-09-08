const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const { processToolCalls, processStreamAndExtractReasoning, getSystemPrompt } = require("./chatHelpers")

const handleStreamingLifecycle = async (req, res) => {
  const { aiProvider, aiKey, messages: userPrompts } = req.body // ADICIONADO: userPrompts
  const { user, userID, aiRequestPayload } = req
  const { initialMessages, options: requestOptions } = aiRequestPayload

  const writeEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    const streamResponse = await ask(aiProvider, aiKey, initialMessages, { ...requestOptions, stream: true })

    let aggregatedToolCalls = []
    let hasToolCall = false
    let initialReasoningSent = false
    // ADICIONADO: Objeto para montar a primeira resposta completa do assistente
    const firstAssistantMessage = { role: "assistant", content: "", tool_calls: [] }

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

      // ADICIONADO: Agrega o conteúdo da primeira resposta
      if (delta.content) {
        firstAssistantMessage.content += delta.content
      }

      for await (const processedChunk of processStreamAndExtractReasoning([chunk])) {
        if (processedChunk.choices[0]?.delta?.reasoning) initialReasoningSent = true
        writeEvent(processedChunk)
      }
    }

    if (!hasToolCall) return res.end()

    const finalToolCalls = aggregatedToolCalls.map(call => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: call.arguments }
    }))
    // ADICIONADO: Atribui os tool_calls completos à mensagem do assistente
    firstAssistantMessage.tool_calls = finalToolCalls

    writeEvent({ type: "TOOL_EXECUTION_START", tool_calls: finalToolCalls })

    const toolResultMessages = await processToolCalls(finalToolCalls, user)

    // MODIFICADO: A mensagem original do usuário é usada para a próxima etapa
    let messagesForNextStep
    let nextUserPrompts = userPrompts // Usa o userPrompts original por padrão

    const routerToolCallResult = toolResultMessages.find(r => r.name === "selectAgentTool")
    if (routerToolCallResult) {
      const resultData = JSON.parse(routerToolCallResult.content)
      if (resultData.action === "SWITCH_AGENT" && resultData.agent) {
        const newAgentName = resultData.agent
        const newSystemPrompt = await getSystemPrompt(newAgentName, userID)
        const userOnlyMessages = nextUserPrompts.filter(msg => msg.role !== "system")
        messagesForNextStep = [newSystemPrompt, ...userOnlyMessages]
        writeEvent({ type: "AGENT_SWITCH", agent: newAgentName })
      }
    } else {
      // MODIFICADO: Passa a primeira resposta completa do assistente como contexto
      messagesForNextStep = [...initialMessages, firstAssistantMessage, ...toolResultMessages]
    }

    if (initialReasoningSent) writeEvent({ choices: [{ delta: { reasoning: "\n\n...\n\n" } }] })

    const finalResponseStream = await ask(aiProvider, aiKey, sanitizeMessages(messagesForNextStep), { ...requestOptions, stream: true })
    const finalProcessedStream = processStreamAndExtractReasoning(finalResponseStream)

    for await (const finalChunk of finalProcessedStream) {
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

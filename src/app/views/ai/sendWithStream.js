const { ask } = require("../../../utils/api/ai")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const {
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning,
  transformToGemini,
  transformFromGemini
} = require("./chatHelpers")
const { createAIClientFactory } = require("../../../utils/api/ai")

const handleGeminiStream = async (req, res, next) => {
  const { model: modelName, messages: userPrompts, aiKey, use_tools = [], mode } = req.body
  const { userID, user } = req

  try {
    const systemPrompt = await getSystemPrompt(mode, userID)
    const toolOptions = await buildToolOptions("gemini", use_tools, userID, mode)

    const geminiClient = createAIClientFactory("gemini", aiKey)
    const geminiModel = geminiClient.getGenerativeModel({
      model: modelName || "gemini-1.5-flash",
      systemInstruction: {
        parts: [{ text: systemPrompt.content }]
      },
      ...toolOptions
    })

    const allMessages = [...userPrompts]
    const initialHistory = allMessages.slice(0, -1)
    const lastMessage = allMessages[allMessages.length - 1]

    const chat = geminiModel.startChat({
      history: transformToGemini(initialHistory)
    })

    const lastMessageTransformed = transformToGemini([lastMessage])[0]

    // FIX: Adicionada validação para previnir crash com prompts vazios ou não-suportados.
    if (!lastMessageTransformed || !lastMessageTransformed.parts || lastMessageTransformed.parts.length === 0) {
      // Para stream, apenas encerramos a conexão.
      return res.end()
    }

    // Step 1: Envia a mensagem e aguarda a resposta completa em buffer, sem stream para o cliente ainda.
    const result1 = await chat.sendMessageStream(lastMessageTransformed.parts)
    const aggregatedResponse = await result1.response
    const openAIResponse = transformFromGemini(aggregatedResponse)

    // Step 2: Checa se a resposta bufferizada contém um tool call.
    if (openAIResponse.tool_calls && openAIResponse.tool_calls.length > 0) {
      // Informa o cliente que uma ferramenta está sendo usada.
      const toolStatusUpdate = {
        choices: [{
          delta: {
            reasoning: `<think>Recebi uma solicitação de ferramenta. Executando ${openAIResponse.tool_calls.map(t => t.function.name).join(", ")}...</think>`
          }
        }]
      }
      res.write(`data: ${JSON.stringify(toolStatusUpdate)}\n\n`)

      // Step 3: Executa as ferramentas.
      const toolResultMessages = await processToolCalls(openAIResponse.tool_calls, user)
      const functionResponseParts = toolResultMessages.map(toolMsg => ({
        functionResponse: {
          name: toolMsg.name,
          response: JSON.parse(toolMsg.content)
        }
      }))

      // Step 4: Envia o resultado das ferramentas de volta e agora faz o stream da resposta final para o cliente.
      const result2Stream = await chat.sendMessageStream(functionResponseParts)
      for await (const chunk of result2Stream.stream) {
        const text = chunk.text()
        if (text) {
          const openAIDelta = { choices: [{ delta: { content: text } }] }
          res.write(`data: ${JSON.stringify(openAIDelta)}\n\n`)
        }
      }
    } else {
      // Step 5: Se não houve tool call, simplesmente envia a resposta de texto que já foi bufferizada.
      const text = aggregatedResponse.text()
      if (text) {
        const openAIDelta = { choices: [{ delta: { content: text } }] }
        res.write(`data: ${JSON.stringify(openAIDelta)}\n\n`)
      }
    }
  } catch (error) {
    next(error)
  } finally {
    if (!res.writableEnded) {
      res.end()
    }
  }
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

module.exports = {
  handleGeminiStream,
  handleOpenAIStream
}

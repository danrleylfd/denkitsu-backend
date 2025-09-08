// Arquivo: Backend/src/app/middlewares/aiRequestSequence.js

const { getSystemPrompt, buildToolOptions } = require("../views/ai/chatHelpers")

// MODIFICADO: Apenas prepara a requisição, não a executa
const prepareInitialAIRequest = async (req, res, next) => {
  const { model, messages: userPrompts, use_tools = [], mode } = req.body
  const { userID, user } = req

  const systemPrompt = await getSystemPrompt(mode, userID)

  // Filtra qualquer system message anterior para evitar duplicidade
  const userOnlyMessages = userPrompts.filter(msg => msg.role !== "system")

  let messagesForFirstCall = [systemPrompt, ...userOnlyMessages]

  // Para o Roteador, removemos conteúdo não-texto para a primeira chamada de decisão
  if (mode === "Roteador") {
    const textOnlyUserPrompts = userOnlyMessages.map((msg) => {
      if (Array.isArray(msg.content)) {
        const textContent = msg.content.find((part) => part.type === "text")
        return { ...msg, content: textContent ? textContent.text : "" }
      }
      return msg
    })
    messagesForFirstCall = [systemPrompt, ...textOnlyUserPrompts]
  }

  const toolOptions = await buildToolOptions(req.body.aiProvider, use_tools, userID, mode)

  // Salva o payload preparado para ser usado pela view
  req.aiRequestPayload = {
    initialMessages: messagesForFirstCall,
    originalUserMessages: [systemPrompt, ...userOnlyMessages], // Mantém as mensagens originais com imagens, etc.
    options: { model, customApiUrl: req.body.customApiUrl, ...toolOptions }
  }

  next()
}

// REMOVIDO: makePrimaryAIRequest e handleToolCalls
// A lógica foi movida para as novas views handleStreamLifecycle e handleNonStreamLifecycle

module.exports = {
  prepareInitialAIRequest
}

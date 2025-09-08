const { getSystemPrompt, buildToolOptions } = require("../views/ai/chatHelpers")

const prepareInitialAIRequest = async (req, res, next) => {
  const { model, messages: userPrompts, use_tools = [], mode } = req.body
  const { userID, user } = req

  const systemPrompt = await getSystemPrompt(mode, userID)
  const userOnlyMessages = userPrompts.filter(msg => msg.role !== "system")

  let messagesForFirstCall = [systemPrompt, ...userOnlyMessages]

  if (mode === "Roteador") {
    const textOnlyUserPrompts = userOnlyMessages.map((msg) => {
      if (Array.isArray(msg.content)) {
        const textContent = msg.content.find((part) => part.type === "text")
        // MODIFICADO: Acessa a propriedade correta do conteúdo de texto
        return { ...msg, content: textContent ? textContent.text : "" }
      }
      return msg
    })
    messagesForFirstCall = [systemPrompt, ...textOnlyUserPrompts]
  }

  const toolOptions = await buildToolOptions(req.body.aiProvider, use_tools, userID, mode)

  // MODIFICADO: Renomeado para clareza
  req.aiRequestPayload = {
    initialMessages: messagesForFirstCall,
    originalUserMessages: userPrompts, // Passa os prompts originais do usuário
    options: { model, customApiUrl: req.body.customApiUrl, ...toolOptions }
  }

  next()
}

module.exports = {
  prepareInitialAIRequest
}

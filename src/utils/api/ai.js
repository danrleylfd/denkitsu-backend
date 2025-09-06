const OpenAI = require("openai")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const createAppError = require("../errors")
const { transformToGemini, transformFromGemini } = require("../../app/views/ai/chatHelpers")

const providerConfig = {
  groq: {
    apiUrl: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
    defaultModel: "openai/gpt-oss-120b"
  },
  openrouter: {
    apiUrl: process.env.OPENROUTER_API_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: "deepseek/deepseek-r1-0528:free"
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    defaultModel: "gemini-1.5-flash"
  }
}

const createAIClientFactory = (provider, apiKey, customApiUrl) => {
  if (provider === "gemini") {
    const finalApiKey = apiKey || providerConfig.gemini?.apiKey
    if (!finalApiKey) throw new Error("API key para Gemini não encontrada")
    return new GoogleGenerativeAI(finalApiKey)
  }
  const config = providerConfig[provider]
  const finalApiUrl = customApiUrl || config?.apiUrl
  if (!finalApiUrl) throw new Error(`Provedor de IA inválido ou URL não configurada: ${provider}`)
  const finalApiKey = apiKey || config?.apiKey
  if (!finalApiKey) throw new Error(`API key para ${provider} não encontrada`)
  return new OpenAI({ apiKey: finalApiKey, baseURL: finalApiUrl })
}

const ask = async (aiProvider, aiKey, prompts, options = {}) => {
  const { customApiUrl, ...restOptions } = options
  const timestampsMsg = { role: "system", content: `O sistema informa a data atual em formato ISO: ${new Date().toISOString()}, converta para horário de Brasília conforme necessidade do usuário, não mostre se o usuário não solicitar, use como referência temporal quando o usuário mencionar alguma data ou quando alguma tool fornecer uma data.` }
  const finalPrompts = [timestampsMsg, ...prompts]

  if (aiProvider === "gemini") {
    const { model: modelName, stream, ...props } = restOptions
    const geminiClient = createAIClientFactory(aiProvider, aiKey)
    const geminiModel = geminiClient.getGenerativeModel({
      model: modelName || providerConfig.gemini.defaultModel,
      tools: props.tools,
      toolConfig: props.toolConfig
    })
    const geminiContents = transformToGemini(finalPrompts)
    const history = geminiContents.length > 1 ? geminiContents.slice(0, -1) : []
    const lastMessage = geminiContents.length > 0 ? geminiContents[geminiContents.length - 1] : { role: "user", parts: [{ text: "" }] }

    try {
      const chat = geminiModel.startChat({ history })
      if (stream) {
        const streamResult = await chat.sendMessageStream(lastMessage.parts)
        // O streaming do Gemini será tratado diretamente no `sendWithStream` para simplicidade agora.
        // Esta função se concentrará na resposta sem streaming para Gemini.
        throw new Error("Streaming para Gemini deve ser tratado em uma função dedicada.")
      }
      const result = await chat.sendMessage(lastMessage.parts)
      const openAIResponse = transformFromGemini(result.response)
      return { status: 200, data: { choices: [{ message: openAIResponse }] } }
    } catch (error) {
       console.error(`Erro ao chamar a API ${aiProvider}:`, {
        message: error.message,
        stack: error.stack
      })
      throw new Error("API_REQUEST_FAILED")
    }
  }

  // Lógica existente para OpenAI e compatíveis
  const openai = createAIClientFactory(aiProvider, aiKey, customApiUrl)
  const { model, stream, ...props } = restOptions
  const config = providerConfig[aiProvider]
  const finalModel = model || config?.defaultModel

  try {
    if (stream) {
      return await openai.chat.completions.create({
        model: finalModel,
        messages: finalPrompts,
        stream: true,
        ...props
      })
    }
    const response = await openai.chat.completions.create({
      model: finalModel,
      messages: finalPrompts,
      stream: false,
      ...props
    })
    return { status: 200, data: response }
  } catch (error) {
    console.error(`Erro ao chamar a API ${aiProvider}:`, {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack
    })
    if (error instanceof OpenAI.AuthenticationError) throw new Error("AUTHENTICATION_FAILED")
    else if (error instanceof OpenAI.RateLimitError) throw new Error("RATE_LIMIT_EXCEEDED")
    else if (error instanceof OpenAI.APIError) throw new Error("API_REQUEST_FAILED")
    else throw new Error("API_UNEXPECTED_ERROR")
  }
}

const checkToolCompatibility = (model) => {
  if (model.supported_parameters && Array.isArray(model.supported_parameters)) {
    const params = new Set(model.supported_parameters)
    return params.has("tools") && params.has("tool_choice")
  }
  return false
}

const checkImageCompatibility = (model) => {
  if (model.architecture?.input_modalities && Array.isArray(model.architecture.input_modalities)) {
    return model.architecture.input_modalities.includes("image")
  }
  return false
}

const checkFileCompatibility = (model) => {
  if (model.architecture?.input_modalities && Array.isArray(model.architecture.input_modalities)) {
    return model.architecture.input_modalities.includes("file")
  }
  return false
}

const getModels = async (aiProvider, apiUrl, apiKey) => {
  if (aiProvider === "custom" && !apiKey) throw createAppError("API Key não fornecida para provedor customizado.", 400, "CUSTOM_API_KEY_MISSING")
  if (aiProvider === "custom" && !apiUrl) throw createAppError("API URL não fornecida para provedor customizado.", 400, "CUSTOM_API_URL_MISSING")
  if (aiProvider === "custom") providerConfig["custom"] = { apiUrl, apiKey, defaultModel: "auto" }

  const models = []
  if (aiProvider === "custom") models.push({ id: "auto", supports_tools: true, supports_images: true, supports_files: true, aiProvider: "custom" })

  const geminiHardcodedModels = [
    { id: "gemini-1.5-flash", supports_tools: true, supports_images: true, supports_files: true, aiProvider: "gemini" },
    { id: "gemini-1.5-pro", supports_tools: true, supports_images: true, supports_files: true, aiProvider: "gemini" },
    { id: "gemini-2.5-pro", supports_tools: true, supports_images: true, supports_files: true, aiProvider: "gemini" },
  ]
  if (aiProvider === "gemini") models.push(...geminiHardcodedModels)


  for (const [provider, config] of Object.entries(providerConfig)) {
    if (provider === "gemini") continue
    const openai = createAIClientFactory(provider, apiKey || config.apiKey, config.apiUrl)
    try {
      const response = await openai.models.list()
      const updatedModels = response.data.map((model) => ({
        id: model.id,
        supports_tools: provider === "openrouter" ? checkToolCompatibility(model) : (provider === "groq") ? true : false,
        supports_images: checkImageCompatibility(model),
        supports_files: checkFileCompatibility(model),
        aiProvider: provider
      }))
      models.push(...updatedModels)
    } catch (error) {
       console.warn(`[AI_UTILS] Não foi possível carregar modelos para o provedor ${provider}.`)
    }
  }

  const openRouterModels = models
    .filter((item) => item.id && item.aiProvider === "openrouter")
    .sort((a, b) => a.id.localeCompare(b.id))
  const freeModels = models
    .filter((item) => item.id && item.id.includes(":free"))
    .sort((a, b) => a.id.localeCompare(b.id))
  const payModels = models
    .filter((item) => item.id && !item.id.includes(":free") && item.aiProvider !== "groq" && item.aiProvider !== "custom")
    .sort((a, b) => a.id.localeCompare(b.id))
  const groqModels = models
    .filter((item) => item.aiProvider === "groq")
    .sort((a, b) => a.id.localeCompare(b.id))
  const customModels = models
    .filter((item) => item.aiProvider === "custom")
    .sort((a, b) => a.id.localeCompare(b.id))
  const geminiModels = models
    .filter((item) => item.aiProvider === "gemini")
    .sort((a, b) => a.id.localeCompare(b.id))

  const prettyModels = { freeModels, openRouterModels, payModels, groqModels, customModels, geminiModels }
  return prettyModels
}

module.exports = { ask, getModels }

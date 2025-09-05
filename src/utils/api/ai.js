const OpenAI = require("openai")

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
  }
}

const createAIClientFactory = (provider, apiKey, customApiUrl) => {
  const config = providerConfig[provider]
  const finalApiUrl = customApiUrl || config?.apiUrl
  if (!finalApiUrl) throw new Error(`Provedor de IA inválido ou URL não configurada: ${provider}`)
  const finalApiKey = apiKey || config?.apiKey
  if (!finalApiKey) throw new Error(`API key para ${provider} não encontrada`)
  return new OpenAI({ apiKey: finalApiKey, baseURL: finalApiUrl })
}

const ask = async (aiProvider, aiKey, prompts, options = {}) => {
  const { customApiUrl, ...restOptions } = options
  const openai = createAIClientFactory(aiProvider, aiKey, customApiUrl)
  const { model, stream, ...props } = restOptions
  const config = providerConfig[aiProvider]
  const finalModel = model || config?.defaultModel
  const timestampsMsg = { role: "system", content: `O sistema informa a data atual em formato ISO: ${new Date().toISOString()}, converta para horário de Brasília conforme necessidade do usuário, não mostre se o usuário não solicitar, use como referência temporal quando o usuário mencionar alguma data ou quando alguma tool fornecer uma data.`}
  try {
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: finalModel,
        messages: [timestampsMsg, ...prompts],
        stream: true,
        ...props
      })
      return streamResponse
    }
    const response = await openai.chat.completions.create({
      model: finalModel,
      messages: [timestampsMsg, ...prompts],
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
  if (aiProvider === "custom") {
    try {
      if (!apiKey) throw new Error("API Key não fornecida para provedor customizado.")
      if (!apiUrl) throw new Error("API URL não fornecida para provedor customizado.")
      const customClient = createAIClientFactory(aiProvider, apiKey, apiUrl)
      const response = await customClient.models.list()
      const autoModel = {
        id: "auto",
        supports_tools: true,
        supports_images: true,
        supports_files: true,
        aiProvider
      }
      if (!response.data || response.data.length === 0) models.push(autoModel)
      let customModels = response.data.map((model) => ({
        id: model.id,
        supports_tools: checkToolCompatibility(model),
        supports_images: checkImageCompatibility(model),
        supports_files: checkFileCompatibility(model),
        aiProvider
      }))
      return customModels
    } catch (error) {
      console.error(`Erro ao obter modelos de ${apiUrl}:`, error.message)
      return []
    }
  }
  const config = providerConfig[aiProvider]
  const openai = createAIClientFactory(aiProvider, apiKey || config.apiKey, apiUrl)
  try {
    const response = await openai.models.list()
    let providerModels = response.data.map((model) => ({
      id: model.id,
      supports_tools: prov === "groq" ? true : checkToolCompatibility(model),
      supports_images: checkImageCompatibility(model),
      supports_files: checkFileCompatibility(model),
      aiProvider
    }))
    return providerModels
  } catch (error) {
    console.error(`Erro ao obter modelos de ${prov}:`, error)
  }
}

module.exports = { ask, getModels }

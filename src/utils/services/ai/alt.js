const OpenAI = require("openai")

const providerConfig = {
  groq: {
    apiUrl: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
    defaultModel: "deepseek-r1-distill-llama-70b"
  },
  openrouter: {
    apiUrl: process.env.OPENROUTER_API_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: "deepseek/deepseek-r1:free"
  },
}

const ask = async (aiProvider, aiKey, prompts, options = {}) => {
  const config = providerConfig[aiProvider]
  if (!config) throw new Error(`Provedor de aiProvider inválido ou não configurado: ${aiProvider}`)
  const apiKey = aiKey || config.apiKey
  if (!apiKey) throw new Error(`API key para ${aiProvider} não encontrada`)
  const openai = new OpenAI({ apiKey, baseURL: config.apiUrl })
  const { model, ...props } = options
  const finalModel = model || config.defaultModel
  try {
    const response = await openai.chat.completions.create({
      model: finalModel,
      messages: prompts,
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
    if (error instanceof OpenAI.AuthenticationError) {
      throw new Error("AUTHENTICATION_FAILED")
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new Error("RATE_LIMIT_EXCEEDED")
    } else if (error instanceof OpenAI.APIError) {
      throw new Error("API_REQUEST_FAILED")
    } else {
      throw new Error("API_UNEXPECTED_ERROR")
    }
  }
}

const getModels = async () => {
  const models = []
  for (const [provider, config] of Object.entries(providerConfig)) {
    const apiKey = config.apiKey
    if (!apiKey) continue
    const openai = new OpenAI({ apiKey, baseURL: config.apiUrl })
    try {
      const response = await openai.models.list()
      const providerModels = response.data.map(model => ({ id: model.id, aiProvider: provider }))
      models.push(...providerModels)
    } catch (error) {
      console.error(`Erro ao obter modelos de ${provider}:`, error)
    }
  }
  return models
}

module.exports = { ask, getModels }

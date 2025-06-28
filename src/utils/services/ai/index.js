const axios = require("axios")
const sysPrompt = require("../../prompts")

const AIPROVIDER = {
  OPENROUTER: "openrouter",
  GROQ: "groq"
}

const providerConfig = {
  [AIPROVIDER.OPENROUTER]: {
    baseURL: process.env.OPENROUTER_API_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: "deepseek/deepseek-r1:free",
    getModels: async (api) => {
      const response = await api.get("/models")
      const models = response.data?.data || []
      const { freeModels, payModels } = models.reduce((acc, model) => {
        if (!model.id) return acc
        const minimalModel = { id: model.id, aiProvider: AIPROVIDER.OPENROUTER }
        const isFree = model.id.includes(":free")
        isFree ? acc.freeModels.push(minimalModel) : acc.payModels.push(minimalModel)
        return acc
      }, { freeModels: [], payModels: [] })
      return [...freeModels,...payModels]
    },
  },
  [AIPROVIDER.GROQ]: {
    baseURL: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
    defaultModel: "deepseek-r1-distill-llama-70b",
    getModels: async (api) => {
      const response = await api.get("/models");
      const models = response.data?.data || [];
      return models.map(model => ({ id: model.id, aiProvider: AIPROVIDER.GROQ }))
    }
  }
}

const ask = async (aiProvider = "openrouter", prompts, options = {}, aiKey = undefined) => {
  const config = providerConfig[aiProvider];
  if (!config) throw new Error(`Provedor de aiProvider inválido ou não configurado: ${aiProvider}`)
  const finalApiKey = aiKey || config.apiKey
  const finalModel = aiProvider === AIPROVIDER.GROQ ? config.defaultModel : options.model || config.defaultModel
  if (!finalApiKey) throw new Error(`API key para ${aiProvider} não encontrada.`)
  const aiAPI = axios.create({
    baseURL: config.baseURL,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${finalApiKey}` }
  })
  const payload = { model: finalModel, messages: [sysPrompt,...prompts] }
  try {
    return await aiAPI.post("/chat/completions", payload)
  } catch (error) {
    const errorData = error.response?.data || { message: error.message }
    console.error(`Erro ao chamar a API ${aiProvider}:`, JSON.stringify(errorData, null, 2))
    throw error
  }
}

const getModels = async () => {
  const promises = Object.values(providerConfig).map(async (config) => {
    if (!config.apiKey) return []
    const api = axios.create({
      baseURL: config.baseURL,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` }
    })
    return await config.getModels(api)
  })
  const models = (await Promise.all(promises)).flat()
  return models
}

module.exports = { ask, getModels }

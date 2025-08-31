const OpenAI = require("openai")

const createAIProvider = (providerName, apiKey = null, customConfig = null) => {
  const defaultConfigs = {
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
  let config
  if (providerName === "custom" && customConfig) config = customConfig
  else config = defaultConfigs[providerName] || {}
  const finalApiKey = apiKey || config.apiKey
  if (!finalApiKey) throw new Error(`API key não encontrada para o provedor: ${providerName}`)
  return {
    client: new OpenAI({
      apiKey: finalApiKey,
      baseURL: config.apiUrl
    }),
    defaultModel: config.defaultModel || "default-model"
  }
}

module.exports = { createAIProvider }

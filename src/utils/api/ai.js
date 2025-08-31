const { createAIProvider } = require("../helpers/aiProviderFactory")

const getModels = async (providerName, apiKey = null, customConfig = null) => {
  try {
    const { client, defaultModel } = createAIProvider(providerName, apiKey, customConfig)
    const response = await client.models.list()
    return response.data.map(model => ({
      id: model.id,
      name: model.id.split('/').pop() || model.id,
      provider: providerName,
      supports_tools: model.id.includes("tool") || false,
      supports_images: model.id.includes("vision") || false,
      supports_files: false
    }))
  } catch (error) {
    console.error(`Erro ao obter modelos do provedor ${providerName}:`, error.message)
    throw new Error(`Falha ao buscar modelos do provedor ${providerName}. Verifique suas configurações.`)
  }
}

const ask = async (providerName, apiKey, prompts, options = {}) => {
  try {
    const { client, defaultModel } = createAIProvider(providerName, apiKey)
    const model = options.model || defaultModel
    const completion = await client.chat.completions.create({
      model,
      messages: prompts,
      stream: options.stream,
      ...options
    })
    return completion
  } catch (error) {
    console.error(`Erro na requisição para ${providerName}:`, error.message)
    throw error
  }
}

module.exports = { ask, getModels }

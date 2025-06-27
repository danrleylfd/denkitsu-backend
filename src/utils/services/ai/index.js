const axios = require("axios")
const sysPrompt = require("../../prompts")

const ask = async (llm = "openrouter", prompts, options = {}, aiKey = undefined) => {
  const apiKey = llm === "groq" ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY
  const apiUrl = llm === "groq"? process.env.GROQ_API_URL : process.env.OPENROUTER_API_URL
  console.log({ apiKey, apiUrl })
  const aiAPI = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey || apiKey}` }
  })
  try {
    return await aiAPI.post("/chat/completions", {
      model: llm === "grok" ? "deepseek-r1-distill-llama-70b" : options.model,
      messages: [sysPrompt, ...prompts]
    })
  } catch (error) {
    console.error(`Error calling ${llm} API:`, error)
    throw error
  }
}

module.exports = ask

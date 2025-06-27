const axios = require("axios")
const sysPrompt = require("../../prompts")

const ask = async (llm = "openrouter", prompts, options = {}, aiKey = undefined) => {
  console.log("llm:", llm)
  const apiKey = llm === "groq" ? process.env.GROQ_API_KEY : aiKey ? aiKey : process.env.OPENROUTER_API_KEY
  const apiUrl = llm === "groq"? process.env.GROQ_API_URL : process.env.OPENROUTER_API_URL
  const aiAPI = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }
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

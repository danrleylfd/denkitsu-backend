const axios = require("axios")
const sysPrompt = require("../../prompts")

const ask = async (prompts, options = {}, aiKey = undefined) => {
  const aiAPI = axios.create({
    baseURL: process.env.OPENROUTER_API_URL,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey || process.env.OPENROUTER_API_KEY}` }
  })
  try {
    return await aiAPI.post("/chat/completions", {
      model: options.model,
      messages: [sysPrompt, ...prompts]
    })
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    throw error
  }
}

module.exports = ask

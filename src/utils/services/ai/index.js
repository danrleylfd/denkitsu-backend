const axios = require("axios")

const aiAPI = axios.create({
  baseURL: process.env.AI_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.AI_API_KEY}`
  }
})

const ask = async (prompts, options = {}) => {
  try {
    const res = await aiAPI.post("/chat/completions", {
      model: options.model,
      messages: [...prompts]
    })
    return res
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    throw error
  }
}


module.exports = ask

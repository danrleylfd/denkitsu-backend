const axios = require("axios")

const newsService = async () => {
  const newsAPI = axios.create({ baseURL: process.env.NEWS_API_URL })
  try {
    return newsAPI.get(`/top-headlines/?apiKey=${process.env.NEWS_API_KEY}&pageSize=1&category=technology`)
  } catch (error) {
    console.error("Error calling API:", error)
    throw error
  }
}

module.exports = newsService

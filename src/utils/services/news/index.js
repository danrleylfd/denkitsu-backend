const axios = require("axios")

const newsService = async () => {
  const newsAPI = axios.create({ baseURL: process.env.NEWS_API_URL })
  try {
    // return newsAPI.get(`/top-headlines/?apiKey=${process.env.NEWS_API_KEY}&pageSize=1&category=technology`)
    return newsAPI.get(`/everything/?apiKey=${process.env.NEWS_API_KEY}&pageSize=1&sources=the-next-web,wired,ars-technica,engadget,techcrunch,techcrunch-cn,techradar,the-verge,wired-de,hacker-news,recode,t3n,gruenderszene,crypto-coins-news`)
  } catch (error) {
    console.error("Error calling API:", error)
    throw error
  }
}

module.exports = newsService

const axios = require("axios")

const searchNews = async (searchTerm) => {
  const newsAPI = axios.create({ baseURL: process.env.NEWS_API_URL })
  try {
    // return newsAPI.get(`/top-headlines/?apiKey=${process.env.NEWS_API_KEY}&pageSize=1&category=technology`)
    return newsAPI.get(`/everything/?apiKey=${process.env.NEWS_API_KEY}&pageSize=1${searchTerm ? `&q=${searchTerm}` : ""}&sources=the-next-web,wired,ars-technica,engadget,techcrunch,techcrunch-cn,techradar,the-verge,wired-de,hacker-news,recode,t3n,gruenderszene,crypto-coins-news`)
  } catch (error) {
    console.error("Error calling API:", error)
    throw error
  }
}

const newsTool = {
  type: "function",
  function: {
    name: "newsTool",
    description: "Busca a notícia mais recentes sobre um tópico específico. Ideal para perguntas sobre eventos atuais, política, esportes, finanças, etc.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "O tópico de interesse(em inglês) para a busca de notícias. Por exemplo: 'reforma tributária no Brasil' ou 'lançamentos de foguetes da SpaceX'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchNews, newsTool }

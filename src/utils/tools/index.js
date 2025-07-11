const weatherService = require("../services/weather")
const newsService = require("../services/news")

const availableTools = {
  getWeather: weatherService.getWeatherByLocation,
  searchNews: newsService.searchNews,
}

const tools = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Obtém a previsão do tempo para uma cidade específica.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "A cidade para a qual a previsão do tempo deve ser obtida, por exemplo, 'São Paulo'.",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchNews",
      description: "Busca a notícia mais recentes sobre um tópico específico. Ideal para perguntas sobre eventos atuais, política, esportes, finanças, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "O tópico de interesse para a busca de notícias. Por exemplo: 'reforma tributária no Brasil' ou 'lançamentos de foguetes da SpaceX'.",
          },
        },
        required: ["query"],
      },
    },
  },
]

module.exports = { tools, availableTools }

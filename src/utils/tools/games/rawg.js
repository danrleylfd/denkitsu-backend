const axios = require("axios")
const createAppError = require("../../errors")

const rawgAPI = axios.create({
  baseURL: process.env.RAWG_API_URL,
  params: {
    key: process.env.RAWG_API_KEY
  }
})

const formatGame = (item) => {
  return {
    id: item.id,
    name: item.name,
    released: item.released,
    rating: item.rating,
    platforms: item.platforms?.map(p => p.platform.name) || [],
    genres: item.genres?.map(g => g.name) || [],
    background_image: item.background_image
  }
}

const searchGames = async ({ query }) => {
  try {
    console.log(`[TOOL_CALL] Buscando jogos para: ${query}`)
    const { data } = await rawgAPI.get("/games", {
      params: {
        search: query,
        page_size: 1
      }
    })
    if (!data.results || data.results.length === 0) throw createAppError(`Nenhum jogo encontrado para "${query}".`, 404, "RAWG_NO_RESULTS")
    const results = data.results.map(formatGame)
    return { status: 200, data: results }
  } catch (error) {
    if (error.isOperational) throw error
    console.error(`[GAMES_SERVICE] Erro ao buscar jogos "${query}":`, error.message)
    throw createAppError("Não foi possível conectar ao serviço de busca de jogos (RAWG).", 503, "RAWG_API_ERROR")
  }
}

const gamesTool = {
  type: "function",
  function: {
    name: "gamesTool",
    description: "Use essa tool para buscar informações sobre videogames, como data de lançamento, avaliação e plataformas disponíveis.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "O nome do videogame a ser pesquisado. Exemplo: 'The Witcher 3' ou 'Stardew Valley'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchGames, gamesTool }

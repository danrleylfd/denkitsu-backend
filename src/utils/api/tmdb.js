const axios = require("axios")

const tmdbAPI = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: "pt-BR"
  }
})

const formatMedia = (item) => {
  const baseImageUrl = "https://image.tmdb.org/t/p/w500"
  return {
    id: item.id,
    type: item.media_type,
    title: item.title || item.name,
    overview: item.overview,
    poster_path: item.poster_path ? `${baseImageUrl}${item.poster_path}` : null,
    backdrop_path: item.backdrop_path ? `${baseImageUrl}${item.backdrop_path}` : null,
    release_date: item.release_date || item.first_air_date,
    vote_average: item.vote_average
  }
}

const searchMedia = async (query) => {
  try {
    console.log(`[TOOL_CALL] Buscando mídia para: ${query}`)
    const { data } = await tmdbAPI.get("/search/multi", { params: { query } })
    const results = data.results
      .filter(item => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path)
      .map(formatMedia)
    return { status: 200, data: results }
  } catch (error) {
    console.error(`[MEDIA_SERVICE] Erro ao buscar mídia "${query}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const getMediaDetails = async (type, id) => {
  try {
    const { data } = await tmdbAPI.get(`/${type}/${id}`)
    return { status: 200, data: formatMedia(data) }
  } catch (error) {
    console.error(`[MEDIA_SERVICE] Erro ao buscar detalhes para ${type}/${id}:`, error.message)
    throw new Error("API_ERROR")
  }
}

const cinemaTool = {
  type: "function",
  function: {
    name: "cinemaTool",
    description: "Busca informações sobre filmes, séries, doramas e animes. Retorna uma lista de resultados correspondentes à consulta.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "O nome do filme, série, dorama ou anime a ser pesquisado. Exemplo: 'Parasita' ou 'Breaking Bad'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchMedia, getMediaDetails, cinemaTool }

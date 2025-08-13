const axios = require("axios")

const searchNasaLibrary = async (query) => {
  try {
    console.log(`[TOOL_CALL] Buscando na biblioteca da NASA por: ${query}`)
    const { data } = await axios.get("https://images-api.nasa.gov/search", {
      params: { q: query, media_type: "image,video" }
    })
    if (!data.collection || data.collection.items.length === 0) {
      return {
        status: 404,
        data: { message: `Nenhum resultado encontrado para "${query}" na biblioteca da NASA.` }
      }
    }
    const formattedResults = data.collection.items.slice(0, 5).map(item => ({
      nasa_id: item.data[0].nasa_id,
      title: item.data[0].title,
      media_type: item.data[0].media_type,
      date_created: item.data[0].date_created,
      description: item.data[0].description?.substring(0, 200) + "...", // Uma breve descrição
      thumbnail_url: item.links?.[0]?.href
    }))
    return { status: 200, data: { results: formattedResults } }
  } catch (error) {
    console.error(`[NASA_LIBRARY_SERVICE] Erro ao buscar por "${query}":`, error.response?.data || error.message)
    throw new Error("TOOL_ERROR")
  }
}

const nasaLibraryTool = {
  type: "function",
  function: {
    name: "nasaLibraryTool",
    description: "Use esta ferramenta para pesquisar na vasta biblioteca de imagens e vídeos da NASA. É ideal para encontrar mídias sobre tópicos específicos como planetas, nebulosas, missões espaciais, astronautas, etc.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "O termo ou frase a ser pesquisado. Por exemplo: 'galáxia de Andrômeda' ou 'pouso na Lua'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchNasaLibrary, nasaLibraryTool }

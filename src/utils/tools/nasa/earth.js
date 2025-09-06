const axios = require("axios")
const createAppError = require("../../errors")

const getEarthImages = async () => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw createAppError("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.", 500, "NASA_API_KEY_MISSING")
    console.log("[TOOL_CALL] Buscando as imagens mais recentes da Terra (EPIC)")
    const { data } = await axios.get(`${process.env.NASA_API_URL}/EPIC/api/natural/images`, {
      params: { api_key: apiKey }
    })
    if (!data || data.length === 0) throw createAppError("Nenhuma imagem recente da Terra foi encontrada no serviço da NASA.", 404, "NASA_EARTH_NO_IMAGES")
    const formattedImages = data.slice(0, 5).map(image => {
      const date = new Date(image.date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return {
        caption: image.caption,
        date: image.date,
        image_url: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${image.image}.png`,
        coordinates: image.centroid_coordinates
      }
    })
    return { status: 200, data: { images: formattedImages } }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[EPIC_SERVICE] Erro ao buscar imagens da Terra:", error.response?.data || error.message)
    throw createAppError("Falha ao conectar com o serviço de imagens da Terra da NASA (EPIC).", 503, "NASA_EPIC_API_ERROR")
  }
}

const earthTool = {
  type: "function",
  function: {
    name: "earthTool",
    description: "Use esta ferramenta para buscar as 5 imagens coloridas mais recentes do planeta Terra, capturadas pela câmera EPIC da NASA. Retorna a imagem, a data e as coordenadas do centro da imagem.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { getEarthImages, earthTool }

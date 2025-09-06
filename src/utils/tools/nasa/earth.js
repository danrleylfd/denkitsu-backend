const axios = require("axios")

const getEarthImages = async () => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw new Error("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.")
    console.log("[TOOL_CALL] Buscando as imagens mais recentes da Terra (EPIC)")
    const { data } = await axios.get(`${process.env.NASA_API_URL}/EPIC/api/natural/images`, {
      params: { api_key: apiKey }
    })
    if (!data || data.length === 0) {
      return {
        status: 404,
        data: { message: "Nenhuma imagem recente da Terra foi encontrada." }
      }
    }
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
    console.error("[EPIC_SERVICE] Erro ao buscar imagens da Terra:", error.response?.data || error.message)
    throw new Error("TOOL_ERROR")
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

const axios = require("axios")
const createAppError = require("../../errors")

const getMarsRoverLatestPhotos = async ({ roverName }) => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw createAppError("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.", 500, "NASA_API_KEY_MISSING")
    console.log(`[TOOL_CALL] Buscando as fotos mais recentes do rover: ${roverName}`)
    const { data } = await axios.get(`${process.env.NASA_API_URL}/mars-photos/api/v1/rovers/${roverName}/latest_photos`, {
      params: { api_key: apiKey }
    })
    if (!data.latest_photos || data.latest_photos.length === 0) throw createAppError(`Nenhuma foto recente foi encontrada para o rover ${roverName}.`, 404, "MARS_ROVER_NO_PHOTOS")
    const formattedPhotos = data.latest_photos.slice(0, 5).map(photo => ({
      id: photo.id,
      sol: photo.sol,
      earth_date: photo.earth_date,
      camera_name: photo.camera.full_name,
      img_src: photo.img_src
    }))
    return { status: 200, data: { photos: formattedPhotos } }
  } catch (error) {
    if (error.isOperational) throw error
    console.error(`[MARS_ROVER_SERVICE] Erro ao buscar fotos para o rover "${roverName}":`, error.response?.data || error.message)
    throw createAppError("Falha ao conectar com o serviço de fotos dos rovers de Marte da NASA.", 503, "NASA_MARS_ROVER_API_ERROR")
  }
}

const marsRoverTool = {
  type: "function",
  function: {
    name: "marsRoverTool",
    description: "Use essa ferramenta para buscar as 5 fotos mais recentes tiradas por um dos rovers da NASA em Marte. Retorna informações como a data terrestre, o dia marciano (sol) e a câmera utilizada.",
    parameters: {
      type: "object",
      properties: {
        roverName: {
          type: "string",
          description: "O nome do rover de Marte. Nomes válidos são: 'curiosity', 'opportunity', 'spirit', 'perseverance'.",
          "enum": ["curiosity", "opportunity", "spirit", "perseverance"]
        }
      },
      required: ["roverName"]
    }
  }
}

module.exports = { getMarsRoverLatestPhotos, marsRoverTool }

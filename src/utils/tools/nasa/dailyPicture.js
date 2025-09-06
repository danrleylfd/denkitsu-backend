const axios = require("axios")
const createAppError = require("../../errors")

const nasaDailyPicture = async () => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw createAppError("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.", 500, "NASA_API_KEY_MISSING")
    console.log("[TOOL_CALL] Buscando a Foto Astronômica de Hoje (APOD)")
    const { data } = await axios.get(`${process.env.NASA_API_URL}/planetary/apod`, {
      params: { api_key: apiKey, thumbs: true }
    })
    return { status: 200, data }
  } catch (error) {
    if (error.isOperational) throw error
    console.error(`[NASA_SERVICE] Erro ao buscar APOD:`, error.response?.data || error.message)
    throw createAppError("Falha ao buscar a Imagem Astronômica do Dia da NASA.", 503, "NASA_APOD_API_ERROR")
  }
}

const nasaTool = {
  type: "function",
  function: {
    name: "nasaTool",
    description: "Use essa tool para buscar a 'Foto Astronômica do Dia' (APOD) da NASA de hoje.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { nasaDailyPicture, nasaTool }

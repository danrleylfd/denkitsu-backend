const axios = require("axios")

const nasaDailyPicture = async () => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw new Error("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.")
    console.log("[TOOL_CALL] Buscando a Foto Astronômica de Hoje (APOD)")
    const { data } = await axios.get(`${process.env.NASA_API_URL}/planetary/apod`, {
      params: { api_key: apiKey, thumbs: true }
    })
    return { status: 200, data }
  } catch (error) {
    console.error(`[NASA_SERVICE] Erro ao buscar APOD:`, error.response?.data || error.message)
    throw error
  }
}

const nasaTool = {
  type: "function",
  function: {
    name: "nasaTool",
    description: "Busca a 'Foto Astronômica do Dia' (APOD) da NASA de hoje.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { nasaDailyPicture, nasaTool }

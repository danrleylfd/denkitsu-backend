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
    const errorData = error.response?.data
    if (errorData?.code === 400) {
      return { status: 400, data: { error: `Requisição inválida. Detalhes: ${errorData.msg}` } }
    }
    return { status: 500, data: { error: "Não foi possível acessar a API da NASA no momento." } }
  }
}

const nasaTool = {
  type: "function",
  function: {
    name: "nasaDailyPicture",
    description: "Busca a 'Foto Astronômica do Dia' (APOD) da NASA de hoje.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { nasaDailyPicture, nasaTool }

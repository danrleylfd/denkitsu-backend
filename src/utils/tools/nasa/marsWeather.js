const axios = require("axios")

const getMarsWeather = async () => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw new Error("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.")
    console.log("[TOOL_CALL] Buscando o clima mais recente em Marte (InSight)")
    const { data } = await axios.get(`${process.env.NASA_API_URL}/insight_weather/`, {
      params: {
        api_key: apiKey,
        feedtype: "json",
        ver: "1.0"
      }
    })
    const solKeys = data.sol_keys
    if (!solKeys || solKeys.length === 0) {
      return {
        status: 404,
        data: { message: "Nenhum dado meteorológico de Marte disponível no momento." }
      }
    }
    const latestSolKey = solKeys[solKeys.length - 1]
    const latestSolData = data[latestSolKey]
    const formattedWeather = {
      sol: latestSolKey,
      terrestrial_date: new Date(latestSolData.First_UTC).toLocaleDateString("pt-BR"),
      temperature_celsius: {
        average: latestSolData.AT?.av?.toFixed(2),
        min: latestSolData.AT?.mn?.toFixed(2),
        max: latestSolData.AT?.mx?.toFixed(2)
      },
      wind_speed_mps: { // metros por segundo
        average: latestSolData.HWS?.av?.toFixed(2)
      }
    }
    return { status: 200, data: formattedWeather }
  } catch (error) {
    console.error("[MARS_WEATHER_SERVICE] Erro ao buscar clima de Marte:", error.response?.data || error.message)
    throw new Error("TOOL_ERROR")
  }
}

const marsWeatherTool = {
  type: "function",
  function: {
    name: "marsWeatherTool",
    description: "Busca o relatório meteorológico mais recente da sonda InSight em Marte. Retorna o 'sol' (dia marciano), a data terrestre, e dados de temperatura (média, mínima, máxima) em Celsius e velocidade do vento.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { getMarsWeather, marsWeatherTool }

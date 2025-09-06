const axios = require("axios")
const createAppError = require("../../errors")

const api = axios.create({
  baseURL: "https://api.openweathermap.org",
  headers: { "Content-Type": "application/json" }
})

const getWeatherByLocation = async ({ location }) => {
  try {
    const { data: geoCodeData } = await api.get(`/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.WEATHER_API_KEY}`)
    if (geoCodeData.length === 0) throw createAppError("Não foi possível encontrar a localização especificada.", 404, "LOCATION_NOT_FOUND")
    const { lat, lon } = geoCodeData[0]
    return await api.get(`/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${process.env.WEATHER_API_KEY}`)
  } catch (error) {
    if (error.isOperational) throw error
    console.error(`[WEATHER_SERVICE] Erro ao obter dados climáticos:`, error.message)
    throw createAppError("Não foi possível obter os dados climáticos no momento.", 503, "WEATHER_API_ERROR")
  }
}

const getWeatherByCoordinates = async (lat, lon) => {
  try {
    return await api.get(`/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${process.env.WEATHER_API_KEY}`)
  } catch (error) {
    console.error(`[WEATHER_SERVICE] Erro ao obter dados climáticos:`, error.message)
    throw createAppError("Não foi possível obter os dados climáticos para as coordenadas fornecidas.", 503, "WEATHER_API_ERROR")
  }
}

const weatherTool = {
  type: "function",
  function: {
    name: "weatherTool",
    description: "Use essa tool para obter a previsão do tempo para uma cidade específica, Use o formato Clima.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "A cidade para a qual a previsão do tempo deve ser obtida, por exemplo, 'São Paulo'."
        }
      },
      required: ["location"]
    }
  }
}

module.exports = { getWeatherByLocation, getWeatherByCoordinates, weatherTool }

const { getWeatherByLocation: getByLocation } = require("../../../utils/api/weather")

const getWeatherByLocation = async (req, res) => {
  try {
    const { location } = req.params
    const { status, data } = await getByLocation(location)
    return res.status(status).json(data)
  } catch (error) {
    console.error(`[GET_WEATHER_LOCATION] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.response) {
      return res.status(error.response.status).json({
        error: { code: "EXTERNAL_API_ERROR", message: error.response.data.message || "Falha ao buscar dados de clima." }
      })
    }
    return res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado." } })
  }
}

module.exports = getWeatherByLocation

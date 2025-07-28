const { getWeatherByCoordinates: getByCoordinates } = require("../../../utils/api/weather")

const getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.params
    const { status, data } = await getByCoordinates(lat, lon)
    return res.status(status).json(data)
  } catch (error) {
    if (error.response) {
      console.error(`[GET_WEATHER_COORDS] ${new Date().toISOString()} -`, { error: error.response.data })
      return res.status(error.response.status).json({
        error: { code: "EXTERNAL_API_ERROR", message: error.response.data.message || "Falha ao buscar dados de clima." }
      })
    }
    console.error(`[GET_WEATHER_COORDS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = getWeatherByCoordinates

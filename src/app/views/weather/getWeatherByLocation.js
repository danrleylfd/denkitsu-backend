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
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      "LOCATION_NOT_FOUND": { status: 404, message: "A localização especificada não foi encontrada." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = getWeatherByLocation

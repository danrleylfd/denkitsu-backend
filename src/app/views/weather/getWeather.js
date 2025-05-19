const Weather = require("../../../utils/services/weather")

const getWeather = async (req, res) => {
  try {
    const { location } = req.body
    if (!location || location.trim().length < 3) throw new Error("LOCATION_MISSING")
    const { status, data } = await Weather(location)
    return res.status(status).json(data)
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data)
    console.error(`[GET_WEATHER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[GET_WEATHER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LOCATION_MISSING: { status: 422, message: "location is required" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = getWeather

const { getWeatherByCoordinates: getByCoordinates } = require("../../../utils/api/weather")

const getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.params
    if (!lat || lat.trim().length < 3) throw new Error("LATITUDE_MISSING")
    if (!lon || lon.trim().length < 3) throw new Error("LONGITUDE_MISSING")
    const { status, data } = await getByCoordinates(lat, lon)
    return res.status(status).json(data)
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data)
    console.error(`[GET_WEATHER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[GET_WEATHER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LATITUDE_MISSING: { status: 422, message: "lat is required" },
      LONGITUDE_MISSING: { status: 422, message: "lon is required" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = getWeatherByCoordinates

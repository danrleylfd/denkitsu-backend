const { getWeatherByCoordinates: getByCoordinates } = require("../../../utils/api/weather")

const getWeatherByCoordinates = async (req, res) => {
  const { lat, lon } = req.params
  const { status, data } = await getByCoordinates(lat, lon)
  return res.status(status).json(data)
}

module.exports = getWeatherByCoordinates

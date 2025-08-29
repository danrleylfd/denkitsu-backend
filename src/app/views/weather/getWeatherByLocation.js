const { getWeatherByLocation: getByLocation } = require("../../../utils/api/weather")

const getWeatherByLocation = async (req, res) => {
  const { location } = req.params
  const { status, data } = await getByLocation(location)
  return res.status(status).json(data)
}

module.exports = getWeatherByLocation

const { getWeatherByLocation: getByLocation } = require("../../../utils/api/weather")
const createAppError = require("../../../utils/errors")

const getWeatherByLocation = async (req, res) => {
  const { location } = req.params
  const { status, data } = await getByLocation(location)
  console.log(status, data)
  if (status !== 200 || !data) throw createAppError("Não foi possível encontrar a localização", status, "WEATHER_BY_LOCATION_ERROR")
  return res.status(status).json(data)
}

module.exports = getWeatherByLocation

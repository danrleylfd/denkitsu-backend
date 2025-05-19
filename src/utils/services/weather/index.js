const axios = require("axios")

const api = axios.create({
  baseURL: "https://api.openweathermap.org",
  headers: { "Content-Type": "application/json" }
})

const getWeather = async (location) => {
  try {
    const { data: geoCodeData } = await api.get(`/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.WEATHER_API_KEY}`)
    const { lat, lon } = geoCodeData[0]
    return await api.get(`/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${process.env.WEATHER_API_KEY}`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = getWeather

const axios = require("axios")

const api = axios.create({
  baseURL: "https://api.openweathermap.org",
  headers: { "Content-Type": "application/json" }
})

const formatWeatherData = (data) => {
  const formatHour = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: data.timezone })
  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString("pt-BR", { weekday: "long", timeZone: data.timezone })
  const prettyData = {
    timezone: data.timezone,
    current: {
      timestamp: new Date(data.current.dt * 1000).toLocaleString("pt-BR", { timeZone: data.timezone }),
      temp: `${Math.round(data.current.temp)}°C`,
      feels_like: `${Math.round(data.current.feels_like)}°C`,
      pressure: data.current.pressure,
      humidity: data.current.humidity,
      uvi: data.current.uvi,
      wind_speed: `${Math.round(data.current.wind_speed * 3.6)} km/h`,
      weather: {
        main: data.current.weather[0].main,
        description: data.current.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
      },
      sunrise: formatHour(data.current.sunrise),
      sunset: formatHour(data.current.sunset)
    },
    hourly: data.hourly.slice(1, 25).map(hour => ({ // Próximas 24 horas
      time: formatHour(hour.dt),
      temp: `${Math.round(hour.temp)}°C`,
      weather: {
        description: hour.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`
      }
    })),
    daily: data.daily.slice(1).map(day => ({ // Próximos 7 dias
      day: formatDate(day.dt),
      temp: {
        min: `${Math.round(day.temp.min)}°C`,
        max: `${Math.round(day.temp.max)}°C`
      },
      weather: {
        description: day.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`
      },
      sunrise: formatHour(day.sunrise),
      sunset: formatHour(day.sunset)
    }))
  }
  console.log(prettyData)
  return prettyData
}

const _getWeatherData = async (lat, lon) => {
  try {
    const { data } = await api.get(`/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&lang=pt_br&appid=${process.env.WEATHER_API_KEY}`)
    console.log(data)
    return { status: 200, data: formatWeatherData(data) }
  } catch (error) {
    console.error(`[WEATHER_SERVICE] Erro ao obter dados climáticos via One Call API:`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const getWeatherByLocation = async ({ location }) => {
  try {
    const { data: geoCodeData } = await api.get(`/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.WEATHER_API_KEY}`)
    if (geoCodeData.length === 0) throw new Error("LOCATION_NOT_FOUND")
    console.log(geoCodeData)
    const { lat, lon } = geoCodeData[0]
    return await _getWeatherData(lat, lon)
  } catch (error) {
    console.error(`[WEATHER_SERVICE] Erro na geocodificação para "${location}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const getWeatherByCoordinates = async (lat, lon) => {
  return await _getWeatherData(lat, lon)
}

const weatherTool = {
  type: "function",
  function: {
    name: "weatherTool",
    description: "Use essa tool para obter a previsão do tempo para uma cidade específica.",
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

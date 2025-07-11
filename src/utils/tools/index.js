// src/utils/tools.js
const weatherService = require("../services/weather")

const availableTools = {
  getWeather: weatherService.getWeatherByLocation,
}

const tools = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Obtém a previsão do tempo para uma cidade específica.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "A cidade para a qual a previsão do tempo deve ser obtida, por exemplo, 'São Paulo'.",
          },
        },
        required: ["location"],
      },
    },
  },
]

module.exports = { tools, availableTools }

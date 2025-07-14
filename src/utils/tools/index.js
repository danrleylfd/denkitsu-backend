const weatherService = require("../services/weather")
const newsService = require("../services/news")
const wikipediaService = require("../services/wikipedia")

const availableTools = {
  searchNews: newsService.searchNews,
  getWeather: weatherService.getWeatherByLocation,
  searchWikipedia: wikipediaService.searchWikipedia
}

const tools = [
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikiPediaTool
]

module.exports = { availableTools, tools }

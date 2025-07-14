const weatherService = require("../services/weather")
const newsService = require("../services/news")
const wikipediaService = require("../services/wikipedia")
const browserService = require("../services/browser")

const availableTools = {
  searchNews: newsService.searchNews,
  getWeather: weatherService.getWeatherByLocation,
  searchWikipedia: wikipediaService.searchWikipedia,
  browseUrl: browserService.browseUrl
}

const tools = [
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikiPediaTool,
  browserService.browseTool
]

module.exports = { availableTools, tools }

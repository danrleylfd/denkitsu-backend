const weatherService = require("../services/weather")
const newsService = require("../services/news")
const wikipediaService = require("../services/wikipedia")
const browserService = require("../services/browser")
const genshinService = require("../services/genshin")
const httpService = require("../services/http")

const availableTools = {
  searchNews: newsService.searchNews,
  getWeather: weatherService.getWeatherByLocation,
  searchWikipedia: wikipediaService.searchWikipedia,
  browseUrl: browserService.browseUrl,
  getPlayerBuild: genshinService.getPlayerBuild,
  executeHttpRequest: httpService.executeHttpRequest
}

const tools = [
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikipediaTool,
  browserService.browseTool,
  genshinService.genshinTool,
  httpService.httpTool
]

module.exports = { availableTools, tools }

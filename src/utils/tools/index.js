const browserService = require("../services/browser")
const httpService = require("../services/http")
const wikipediaService = require("../services/wikipedia")
const newsService = require("../services/news")
const weatherService = require("../services/weather")
const genshinService = require("../services/genshin")
const pokedexService = require("../services/pokedex")

const availableTools = {
  browseUrl: browserService.browseUrl,
  executeHttpRequest: httpService.executeHttpRequest,
  searchWikipedia: wikipediaService.searchWikipedia,
  searchNews: newsService.searchNews,
  getWeather: weatherService.getWeatherByLocation,
  getPlayerBuild: genshinService.getPlayerBuild,
  getPokemonInfo: pokedexService.getPokemonInfo,
}

const tools = [
  browserService.browseTool,
  httpService.httpTool,
  wikipediaService.wikipediaTool,
  newsService.newsTool,
  weatherService.weatherTool,
  genshinService.genshinTool,
  pokedexService.pokedexTool,
]

module.exports = { availableTools, tools }

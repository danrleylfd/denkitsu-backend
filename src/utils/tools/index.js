const browserService = require("../services/browser")
const httpService = require("../services/http")
const wikipediaService = require("../services/wikipedia")
const newsService = require("../services/news")
const weatherService = require("../services/weather")
const genshinService = require("../services/genshin")
const pokedexService = require("../services/pokedex")
const criptoService = require("../services/cripto")

const availableTools = {
  browseUrl: browserService.browseUrl,
  executeHttpRequest: httpService.executeHttpRequest,
  searchWikipedia: wikipediaService.searchWikipedia,
  searchNews: newsService.searchNews,
  getWeather: weatherService.getWeatherByLocation,
  getPlayerBuild: genshinService.getPlayerBuild,
  getPokemonDetails: pokedexService.getPokemonDetails,
  getCoinQuote: criptoService.getCoinQuote,
}

const tools = [
  browserService.browserTool,
  httpService.httpTool,
  wikipediaService.wikipediaTool,
  newsService.newsTool,
  weatherService.weatherTool,
  genshinService.genshinTool,
  pokedexService.pokedexTool,
  criptoService.criptoTool,
]

module.exports = { availableTools, tools }

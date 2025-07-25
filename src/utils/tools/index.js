const browserService = require("../api/browser")
const httpService = require("../api/http")
const wikipediaService = require("../api/wikipedia")
const newsService = require("../api/news")
const weatherService = require("../api/weather")
const genshinService = require("../api/genshin")
const pokedexService = require("../api/pokedex")
const criptoService = require("../api/cripto")

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

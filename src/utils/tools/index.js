const browserService = require("../api/browser")
const httpService = require("../api/http")

const criptoService = require("../api/cripto")
const nasaService = require("../api/nasa")
const newsService = require("../api/news")
const weatherService = require("../api/weather")
const wikipediaService = require("../api/wikipedia")

const genshinService = require("../api/genshin")
const pokedexService = require("../api/pokedex")

const availableTools = {
  browserTool: browserService.browseUrl,
  httpTool: httpService.executeHttpRequest,

  criptoTool: criptoService.getCoinQuote,
  nasaTool: nasaService.nasaDailyPicture,
  newsTool: newsService.searchNews,
  weatherTool: weatherService.getWeatherByLocation,
  wikipediaTool: wikipediaService.searchWikipedia,

  genshinTool: genshinService.getPlayerBuild,
  pokedexTool: pokedexService.getPokemonDetails,
}

const tools = [
  browserService.browserTool,
  httpService.httpTool,

  criptoService.criptoTool,
  nasaService.nasaTool,
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikipediaTool,

  genshinService.genshinTool,
  pokedexService.pokedexTool,
]

module.exports = { availableTools, tools }

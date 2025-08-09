const browserService = require("../api/browser")
const duckduckgoService = require("../api/duckduckgo")
const httpService = require("../api/http")

const criptoService = require("../api/cripto")
const nasaService = require("../api/nasa")
const newsService = require("../api/news")
const weatherService = require("../api/weather")
const wikipediaService = require("../api/wikipedia")

const cinemaService = require("../api/tmdb")
const gamesService = require("../api/rawg")
const genshinService = require("../api/genshin")
const pokedexService = require("../api/pokedex")

const availableTools = {
  browserTool: browserService.browseUrl,
  duckduckgoTool: duckduckgoService.searchDuckDuckGo,
  httpTool: httpService.executeHttpRequest,

  criptoTool: criptoService.getCoinQuote,
  nasaTool: nasaService.nasaDailyPicture,
  newsTool: newsService.searchNews,
  weatherTool: weatherService.getWeatherByLocation,
  wikipediaTool: wikipediaService.searchWikipedia,

  cinemaTool: cinemaService.searchMedia,
  gamesTool: gamesService.searchGames,
  genshinTool: genshinService.getPlayerBuild,
  pokedexTool: pokedexService.getPokemonDetails,
}

const tools = [
  browserService.browserTool,
  duckduckgoService.duckduckgoTool,
  httpService.httpTool,

  criptoService.criptoTool,
  nasaService.nasaTool,
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikipediaTool,

  cinemaService.cinemaTool,
  gamesService.gamesTool,
  genshinService.genshinTool,
  pokedexService.pokedexTool,
]

module.exports = { availableTools, tools }

const browserService = require("../api/browser")
const duckduckgoService = require("../api/duckduckgo")
const httpService = require("../api/http")

const criptoService = require("../api/cripto")
const nasaService = require("../api/nasa")
const nasaLibraryService = require("../api/nasaLibrary")
const earthService = require("../api/earth")
const marsRoverService = require("../api/marsRover")
const newsService = require("../api/news")
const weatherService = require("../api/weather")
const wikipediaService = require("../api/wikipedia")

const cinemaService = require("../api/tmdb")
const gamesService = require("../api/rawg")
const albionService = require("../api/albion")
const genshinService = require("../api/genshin")
const pokedexService = require("../api/pokedex")

const availableTools = {
  browserTool: browserService.browseUrl,
  duckduckgoTool: duckduckgoService.searchDuckDuckGo,
  httpTool: httpService.executeHttpRequest,

  criptoTool: criptoService.getCoinQuote,
  nasaTool: nasaService.nasaDailyPicture,
  nasaLibraryTool: nasaLibraryService.searchNasaLibrary,
  earthTool: earthService.getEarthImages,
  marsRoverTool: marsRoverService.getMarsRoverLatestPhotos,
  newsTool: newsService.searchNews,
  weatherTool: weatherService.getWeatherByLocation,
  wikipediaTool: wikipediaService.searchWikipedia,

  cinemaTool: cinemaService.searchMedia,
  gamesTool: gamesService.searchGames,
  albionTool: albionService.getGoldPrice,
  genshinTool: genshinService.getPlayerBuild,
  pokedexTool: pokedexService.getPokemonDetails,
}

const tools = [
  browserService.browserTool,
  duckduckgoService.duckduckgoTool,
  httpService.httpTool,

  criptoService.criptoTool,
  nasaService.nasaTool,
  nasaLibraryService.nasaLibraryTool,
  earthService.earthTool,
  marsRoverService.marsRoverTool,
  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikipediaTool,

  cinemaService.cinemaTool,
  gamesService.gamesTool,
  albionService.albionTool,
  genshinService.genshinTool,
  pokedexService.pokedexTool,
]

module.exports = { availableTools, tools }

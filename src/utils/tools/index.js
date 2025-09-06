const agentService = require("../api/agent")

const bibleService = require("./search/bible")
const browserService = require("./search/browser")
const duckduckgoService = require("./search/duckduckgo")
const httpService = require("./search/http")

const criptoService = require("../api/cripto")
const nasaService = require("./nasa/dailyPicture")
const nasaLibraryService = require("./nasa/library")
const earthService = require("./nasa/earth")
const marsRoverService = require("./nasa/marsRover")
const asteroidsService = require("./nasa/asteroids")
const spaceWeatherService = require("./nasa/spaceWeather")
const marsWeatherService = require("./nasa/marsWeather")
const newsService = require("../api/news")
const weatherService = require("./search/weather")
const wikipediaService = require("./search/wikipedia")

const cinemaService = require("./search/tmdb")
const gamesService = require("./search/rawg")
const albionService = require("./entertainment/albion")
const genshinService = require("../api/genshinAnalysis")
const hoyoCodesService = require("../api/hoyoCodes")
const pokedexService = require("./entertainment/pokedex")

const ttsService = require("../api/tts")

const adminService = require("../api/admin")

const availableTools = {
  selectAgentTool: agentService.selectAgent,

  bibleTool: bibleService.searchBible,
  browserTool: browserService.browseUrl,
  duckduckgoTool: duckduckgoService.searchDuckDuckGo,
  httpTool: httpService.executeHttpRequest,

  criptoTool: criptoService.getCoinQuote,
  nasaTool: nasaService.nasaDailyPicture,
  nasaLibraryTool: nasaLibraryService.searchNasaLibrary,
  earthTool: earthService.getEarthImages,
  marsRoverTool: marsRoverService.getMarsRoverLatestPhotos,
  asteroidsTool: asteroidsService.getNearEarthObjects,
  spaceWeatherTool: spaceWeatherService.getSpaceWeatherEvents,
  marsWeatherTool: marsWeatherService.getMarsWeather,
  newsTool: newsService.searchNews,
  weatherTool: weatherService.getWeatherByLocation,
  wikiTool: wikipediaService.searchWikipedia,

  cinemaTool: cinemaService.searchMedia,
  gamesTool: gamesService.searchGames,
  albionTool: albionService.getGoldPrice,
  genshinTool: genshinService.genshinAnalysis,
  hoyoCodesTool: hoyoCodesService.getHoyoCodes,
  pokedexTool: pokedexService.getPokemonDetails,

  cancelSubscriptionTool: adminService.cancelSubscription,
  refundSubscriptionTool: adminService.refundSubscription,
  reactivateSubscriptionTool: adminService.reactivateSubscription,
  syncSubscriptionTool: adminService.syncSubscription,

  ttsTool: ttsService.textToSpeech,
}

const tools = [
  agentService.selectAgentTool,

  bibleService.bibleTool,
  browserService.browserTool,
  duckduckgoService.duckduckgoTool,
  httpService.httpTool,

  criptoService.criptoTool,
  nasaService.nasaTool,
  nasaLibraryService.nasaLibraryTool,
  earthService.earthTool,
  marsRoverService.marsRoverTool,
  asteroidsService.asteroidsTool,
  spaceWeatherService.spaceWeatherTool,
  marsWeatherService.marsWeatherTool,

  newsService.newsTool,
  weatherService.weatherTool,
  wikipediaService.wikiTool,

  cinemaService.cinemaTool,
  gamesService.gamesTool,
  albionService.albionTool,
  genshinService.genshinTool,
  hoyoCodesService.hoyoCodesTool,
  pokedexService.pokedexTool,

  adminService.cancelSubscriptionTool,
  adminService.refundSubscriptionTool,
  adminService.reactivateSubscriptionTool,
  adminService.syncSubscriptionTool,

  ttsService.ttsTool,
]

module.exports = { availableTools, tools }

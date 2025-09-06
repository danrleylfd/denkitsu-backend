const adminService = require("../api/admin")
const agentService = require("../api/agent")
const newsService = require("../api/news")

const ttsService = require("./audio/tts")

const albionService = require("./games/albion")
const genshinService = require("./games/genshinAnalysis")
const hoyoCodesService = require("./games/hoyoCodes")
const pokedexService = require("./games/pokedex")
const gamesService = require("./games/rawg")

const asteroidsService = require("./nasa/asteroids")
const nasaService = require("./nasa/dailyPicture")
const earthService = require("./nasa/earth")
const nasaLibraryService = require("./nasa/library")
const marsRoverService = require("./nasa/marsRover")
const marsWeatherService = require("./nasa/marsWeather")
const spaceWeatherService = require("./nasa/spaceWeather")

const bibleService = require("./search/bible")
const browserService = require("./search/browser")
const criptoService = require("./search/cripto")
const duckduckgoService = require("./search/duckduckgo")
const httpService = require("./search/http")
const cinemaService = require("./search/tmdb")
const weatherService = require("./search/weather")
const wikipediaService = require("./search/wikipedia")

const availableTools = {
  cancelSubscriptionTool: adminService.cancelSubscription,
  refundSubscriptionTool: adminService.refundSubscription,
  reactivateSubscriptionTool: adminService.reactivateSubscription,
  syncSubscriptionTool: adminService.syncSubscription,
  selectAgentTool: agentService.selectAgent,
  newsTool: newsService.searchNews,

  ttsTool: ttsService.textToSpeech,

  albionTool: albionService.getGoldPrice,
  genshinTool: genshinService.genshinAnalysis,
  hoyoCodesTool: hoyoCodesService.getHoyoCodes,
  pokedexTool: pokedexService.getPokemonDetails,
  gamesTool: gamesService.searchGames,

  asteroidsTool: asteroidsService.getNearEarthObjects,
  nasaTool: nasaService.nasaDailyPicture,
  earthTool: earthService.getEarthImages,
  nasaLibraryTool: nasaLibraryService.searchNasaLibrary,
  marsRoverTool: marsRoverService.getMarsRoverLatestPhotos,
  marsWeatherTool: marsWeatherService.getMarsWeather,
  spaceWeatherTool: spaceWeatherService.getSpaceWeatherEvents,

  bibleTool: bibleService.searchBible,
  browserTool: browserService.browseUrl,
  criptoTool: criptoService.getCoinQuote,
  duckduckgoTool: duckduckgoService.searchDuckDuckGo,
  httpTool: httpService.executeHttpRequest,
  cinemaTool: cinemaService.searchMedia,
  weatherTool: weatherService.getWeatherByLocation,
  wikiTool: wikipediaService.searchWikipedia,
}

const tools = [
  adminService.cancelSubscriptionTool,
  adminService.refundSubscriptionTool,
  adminService.reactivateSubscriptionTool,
  adminService.syncSubscriptionTool,
  agentService.selectAgentTool,
  newsService.newsTool,

  ttsService.ttsTool,

  albionService.albionTool,
  genshinService.genshinTool,
  hoyoCodesService.hoyoCodesTool,
  pokedexService.pokedexTool,
  gamesService.gamesTool,

  asteroidsService.asteroidsTool,
  nasaService.nasaTool,
  earthService.earthTool,
  nasaLibraryService.nasaLibraryTool,
  marsRoverService.marsRoverTool,
  marsWeatherService.marsWeatherTool,
  spaceWeatherService.spaceWeatherTool,

  bibleService.bibleTool,
  browserService.browserTool,
  criptoService.criptoTool,
  duckduckgoService.duckduckgoTool,
  httpService.httpTool,
  cinemaService.cinemaTool,
  weatherService.weatherTool,
  wikipediaService.wikiTool,
]

module.exports = { availableTools, tools }

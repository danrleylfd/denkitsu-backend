const adminService = require("../api/admin")
const agentService = require("../api/agent")

const ttsService = require("./audio/tts")

const albionService = require("./games/albion")
const genshinCharAnalysisService = require("./games/genshinCharAnalysis")
const genshinCharDetailsService = require("./games/genshinCharDetails")
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
const newsService = require("./search/news")
const tmdbService = require("./search/tmdb")
const weatherService = require("./search/weather")
const wikipediaService = require("./search/wikipedia")

const genshinService = { ...genshinCharAnalysisService, ...genshinCharDetailsService }

const availableTools = {
  cancelSubscriptionTool: adminService.cancelSubscription,
  refundSubscriptionTool: adminService.refundSubscription,
  reactivateSubscriptionTool: adminService.reactivateSubscription,
  syncSubscriptionTool: adminService.syncSubscription,
  selectAgentTool: agentService.selectAgent,

  ttsTool: ttsService.textToSpeech,

  albionTool: albionService.getGoldPrice,
  genshinCharAnalysisTool: genshinService.analyzeCharacter,
  genshinCharDetailsTool: genshinService.getCharacterDetails,
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
  newsTool: newsService.searchNews,
  tmdbTool: tmdbService.searchMedia,
  weatherTool: weatherService.getWeatherByLocation,
  wikiTool: wikipediaService.searchWikipedia,
}

const tools = [
  adminService.cancelSubscriptionTool,
  adminService.refundSubscriptionTool,
  adminService.reactivateSubscriptionTool,
  adminService.syncSubscriptionTool,
  agentService.selectAgentTool,

  ttsService.ttsTool,

  albionService.albionTool,
  genshinService.genshinCharAnalysisTool,
  genshinService.genshinCharDetailsTool,
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
  newsService.newsTool,
  tmdbService.tmdbTool,
  weatherService.weatherTool,
  wikipediaService.wikiTool,
]

module.exports = { availableTools, tools }

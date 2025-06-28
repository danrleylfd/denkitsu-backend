const { Router } = require("express")

const routes = Router()

const getWeatherByLocation = require("../views/weather/getWeatherByLocation")
const getWeatherByCoordinates = require("../views/weather/getWeatherByCoordinates")

routes.get("/location/:location", getWeatherByLocation)

routes.get("/coordinates/:lat/:lon", getWeatherByCoordinates)

const loadWeatherRoutes = (app) => app.use("/weather", routes)

module.exports = loadWeatherRoutes

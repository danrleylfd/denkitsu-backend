const { Router } = require("express")
// const logMiddleware = require("../middlewares/log")

const routes = Router()
// routes.use(logMiddleware)

const getWeather = require("../views/weather/getWeather")

routes.get("/:location", getWeather)

const loadWeatherRoutes = (app) => app.use("/weather", routes)

module.exports = loadWeatherRoutes

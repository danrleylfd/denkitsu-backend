const { Router } = require("express")

const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { locationRules, coordinatesRules } = require("../validators/weather")

const routes = Router()

const getWeatherByLocation = require("../views/weather/getWeatherByLocation")
const getWeatherByCoordinates = require("../views/weather/getWeatherByCoordinates")

routes.get("/location/:location", locationRules(), validate, asyncHandler(getWeatherByLocation))

routes.get("/coordinates/:lat/:lon", coordinatesRules(), validate, asyncHandler(getWeatherByCoordinates))

const loadWeatherRoutes = (app) => app.use("/weather", routes)

module.exports = loadWeatherRoutes

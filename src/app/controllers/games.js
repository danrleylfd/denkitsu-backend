const { Router } = require("express")

const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { searchRules } = require("../validators/rawg")

const searchView = require("../views/games/search")

const routes = Router()

routes.get("/search", searchRules(), validate, asyncHandler(searchView))

const loadGamesRoutes = (app) => app.use("/games", routes)

module.exports = loadGamesRoutes

const { Router } = require("express")

const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { searchRules, detailsRules } = require("../validators/tmdb")

const searchView = require("../views/cinema/search")
const detailsView = require("../views/cinema/getDetails")

const routes = Router()

routes.get("/search", searchRules(), validate, asyncHandler(searchView))

routes.get("/details/:type/:id", detailsRules(), validate, asyncHandler(detailsView))

const loadCinemaRoutes = (app) => app.use("/cinema", routes)

module.exports = loadCinemaRoutes

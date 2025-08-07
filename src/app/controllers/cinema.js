const { Router } = require("express")
const validate = require("../middlewares/validator")
const { searchRules, detailsRules } = require("../validators/tmdb")

const searchView = require("../views/cinema/search")
const detailsView = require("../views/cinema/getDetails")

const routes = Router()

routes.get("/search", searchRules(), validate, searchView)

routes.get("/details/:type/:id", detailsRules(), validate, detailsView)

const loadCinemaRoutes = (app) => app.use("/cinema", routes)

module.exports = loadCinemaRoutes

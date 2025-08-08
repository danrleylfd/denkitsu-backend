const { Router } = require("express")
const validate = require("../middlewares/validator")
const { searchRules } = require("../validators/games")

const searchView = require("../views/games/search")

const routes = Router()

routes.get("/search", searchRules(), validate, searchView)

const loadGamesRoutes = (app) => {
  app.use("/games", routes)
}

module.exports = loadGamesRoutes

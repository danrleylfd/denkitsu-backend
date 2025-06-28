const { Router } = require("express")

const routes = Router()

const createOne = require("../views/news/createOne")
const generateOne = require("../views/news/generateOne")
const readOneBySource = require("../views/news/readOneBySource")
const readMany = require("../views/news/readMany")
const readManyPaginate = require("../views/news/readManyPaginate")

routes.post("/", createOne)

routes.post("/generate", generateOne)

routes.get("/", readMany)

routes.get("/pages", readManyPaginate)

routes.get("/:source", readOneBySource)

const loadNewsRoutes = (app) => app.use("/news", routes)

module.exports = loadNewsRoutes

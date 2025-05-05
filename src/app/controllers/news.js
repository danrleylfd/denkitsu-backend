const { Router } = require("express")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(logMiddleware)

const createOne = require("../views/news/createOne")
const readOneBySource = require("../views/news/readOneBySource")
const readMany = require("../views/news/readMany")
const readManyPaginate = require("../views/news/readManyPaginate")

routes.post("/", createOne)

routes.get("/:source", readOneBySource)

routes.get("/", readMany)

routes.get("/pages", readManyPaginate)

const loadNewsRoutes = (app) => app.use("/news", routes)

module.exports = loadNewsRoutes

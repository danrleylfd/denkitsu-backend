const { Router } = require("express")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(logMiddleware)

const createOne = require("../views/news/createOne")
const readOneBySource = require("../views/news/readOneBySource")
const readMany = require("../views/news/readMany")

routes.post("/", createOne)

routes.get("/:source", readOneBySource)

routes.get("/", readMany)

const loadNewsRoutes = (app) => app.use("/news", routes)

module.exports = loadNewsRoutes

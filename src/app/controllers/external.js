const { Router } = require("express")
// const logMiddleware = require("../middlewares/log")

const routes = Router()
// routes.use(logMiddleware)

const getAPI = require("../views/external/index")

routes.get("/", getAPI)

const loadExternalRoutes = (app) => app.use("/external", routes)

module.exports = loadExternalRoutes

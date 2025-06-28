const { Router } = require("express")

const routes = Router()

const getAPI = require("../views/external/index")

routes.get("/", getAPI)

const loadExternalRoutes = (app) => app.use("/external", routes)

module.exports = loadExternalRoutes

const { Router } = require("express")

const asyncHandler = require("../middlewares/asyncHandler")

const routes = Router()

const getAPI = require("../views/external/index")

routes.get("/", asyncHandler(getAPI))

const loadExternalRoutes = (app) => app.use("/external", routes)

module.exports = loadExternalRoutes

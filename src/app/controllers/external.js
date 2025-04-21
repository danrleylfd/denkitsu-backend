const { Router } = require("express")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(logMiddleware)

const getAPI = require("../views/external/index")

routes.get("/", getAPI)

module.exports = (app) => app.use("/external", routes)

const { Router } = require("express")
const routes = Router()

const getAPI = require("../views/external/index")

routes.get("/", getAPI)

module.exports = (app) => app.use("/external", routes)

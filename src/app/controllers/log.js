const { Router } = require("express")
const routes = Router()

const readAll = require("../views/log/readAll")

routes.get("/", readAll)

module.exports = (app) => app.use("/log", routes)

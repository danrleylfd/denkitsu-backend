const { Router } = require("express")

const routes = Router()

const readOne = require("../views/linker/readOne")

routes.get("/:label", readOne)

const loadAccessRoutes = (app) => app.use("/access", routes)

module.exports = loadAccessRoutes

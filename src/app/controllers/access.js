const { Router } = require("express")
const routes = Router()

const readOne = require("../views/linker/readOne")

routes.get("/:label", readOne)

module.exports = (app) => app.use("/", routes)

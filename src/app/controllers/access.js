const { Router } = require("express")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(logMiddleware)

const readOne = require("../views/linker/readOne")

routes.get("/:label", readOne)

module.exports = (app) => app.use("/", routes)

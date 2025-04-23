const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)

const createOne = require("../views/linker/createOne")
const readMany = require("../views/linker/readMany")
const updateOne = require("../views/linker/updateOne")
const deleteOne = require("../views/linker/deleteOne")

routes.post("/", createOne)

routes.get("/", readMany)

routes.get("/by-user", readMany)

routes.get("/:label", readMany)

routes.put("/:oldLabel", updateOne)

routes.delete("/:label", deleteOne)

const loadLinkerRoutes = (app) => app.use("/linkers", routes)

module.exports = loadLinkerRoutes

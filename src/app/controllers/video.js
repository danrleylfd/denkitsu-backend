const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(authMiddleware)
// routes.use(logMiddleware)

const createOne = require("../views/video/createOne")
const readRecents = require("../views/video/readRecents")
const readPopular = require("../views/video/readPopular")
const readManyByUser = require("../views/video/readManyByUser")
const readOne = require("../views/video/readOne")
const updateOne = require("../views/video/updateOne")
const deleteOne = require("../views/video/deleteOne")

routes.post("/", createOne)

routes.get("/", readManyByUser)

routes.get("/one/:video", readOne)

routes.get("/popular", readPopular)

routes.get("/recents", readRecents)

routes.get("/:userID", readManyByUser)

routes.put("/:video", updateOne)

routes.delete("/:video", deleteOne)

const loadVideoRoutes = (app) => app.use("/videos", routes)

module.exports = loadVideoRoutes

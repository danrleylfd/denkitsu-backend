const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/video/createOne")
const readRecents = require("../views/video/readRecents")
const readPopular = require("../views/video/readPopular")
const readOne = require("../views/video/readOne")
const updateOne = require("../views/video/updateOne")
const deleteOne = require("../views/video/deleteOne")

routes.post("/", createOne)

routes.get("/one/:video", readOne)

routes.get("/popular", readPopular)

routes.get("/recents", readRecents)

routes.put("/:video", updateOne)

routes.delete("/:video", deleteOne)

module.exports = (app) => app.use("/videos", routes)

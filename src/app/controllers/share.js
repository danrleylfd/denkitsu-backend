const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")
const videoMiddleware = require("../middlewares/video")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)
routes.use(videoMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

routes.post("/:video", share)

routes.get("/:video", countShares)

const loadShareRoutes = (app) => app.use("/shares", routes)

module.exports = loadShareRoutes

const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

routes.post("/:video", videoMiddleware, share)

routes.get("/:video", videoMiddleware, countShares)

const loadShareRoutes = (app) => app.use("/shares", routes)

module.exports = loadShareRoutes

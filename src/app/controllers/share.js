const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")
const validate = require("../middlewares/validator")
const { videoIdInParams } = require("../validators/share")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

routes.post("/:video", videoIdInParams(), validate, videoMiddleware, share)

routes.get("/:video", videoIdInParams(), validate, videoMiddleware, countShares)

const loadShareRoutes = (app) => app.use("/shares", routes)

module.exports = loadShareRoutes

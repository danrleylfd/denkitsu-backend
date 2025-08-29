const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { videoIdInParams } = require("../validators/share")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

routes.post("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(share))

routes.get("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(countShares))

const loadShareRoutes = (app) => app.use("/shares", routes)

module.exports = loadShareRoutes

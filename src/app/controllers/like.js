const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { videoIdInParams } = require("../validators/like")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const addLike = require("../views/video/likes/addLike")
const getLikeStatus = require("../views/video/likes/getLikeStatus")
const countLikes = require("../views/video/likes/countLikes")
const delLike = require("../views/video/likes/delLike")

routes.post("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(addLike))

routes.get("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(countLikes))

routes.get("/:video/status", videoIdInParams(), validate, asyncHandler(getLikeStatus))

routes.delete("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(delLike))

const loadLikeRoutes = (app) => app.use("/likes", routes)

module.exports = loadLikeRoutes

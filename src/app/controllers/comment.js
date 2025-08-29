const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { videoIdInParams, addCommentRules, deleteCommentRules } = require("../validators/comment")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const addComment = require("../views/video/comments/addComment")
const listComments = require("../views/video/comments/listComments")
const countComments = require("../views/video/comments/countComments")
const delComment = require("../views/video/comments/delComment")

routes.post("/:video", addCommentRules(), validate, videoMiddleware, asyncHandler(addComment))

routes.get("/list/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(listComments))

routes.get("/:video", videoIdInParams(), validate, videoMiddleware, asyncHandler(countComments))

routes.delete("/:video/:comment", deleteCommentRules(), validate, videoMiddleware, asyncHandler(delComment))

const loadCommentRoutes = (app) => app.use("/comments", routes)

module.exports = loadCommentRoutes

const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")
const videoMiddleware = require("../middlewares/video")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)
routes.use(videoMiddleware)

const addComment = require("../views/video/comments/addComment")
const countComments = require("../views/video/comments/countComments")
const delComment = require("../views/video/comments/delComment")

routes.post("/:video", addComment)

routes.get("/:video", countComments)

routes.delete("/:video/:comment", delComment)

const loadCommentRoutes = (app) => app.use("/comments", routes)

module.exports = loadCommentRoutes

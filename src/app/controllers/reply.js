const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const commentMiddleware = require("../middlewares/comment")
const validate = require("../middlewares/validator")
const { createReplyRules, listRepliesRules } = require("../validators/reply")

const routes = Router()

routes.use(authMiddleware)

const replyComment = require("../views/video/comments/replyComment")

const listReplies = require("../views/video/comments/listReplies")

routes.post("/:comment", createReplyRules(), validate, commentMiddleware, replyComment)

routes.get("/:comment", listRepliesRules(), validate, commentMiddleware, listReplies)

const loadReplyRoutes = (app) => app.use("/replys", routes)

module.exports = loadReplyRoutes

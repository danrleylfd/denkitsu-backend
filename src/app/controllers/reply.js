const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const replyMiddleware = require("../middlewares/reply")
const commentMiddleware = require("../middlewares/comment")
const validate = require("../middlewares/validator")
const { createReplyRules, listRepliesRules, deleteReplyRules } = require("../validators/reply")

const routes = Router()
routes.use(authMiddleware)
// routes.use(replyMiddleware)

const replyComment = require("../views/video/comments/replyComment")

const listReplies = require("../views/video/comments/listReplies")

const delReply = require("../views/video/comments/delReply")

routes.post("/:comment", createReplyRules(), validate, commentMiddleware, replyComment)

routes.get("/:comment", listRepliesRules(), validate, commentMiddleware, listReplies)

routes.delete("/:reply", deleteReplyRules(), validate, delReply)

const loadReplyRoutes = (app) => app.use("/replys", routes)

module.exports = loadReplyRoutes

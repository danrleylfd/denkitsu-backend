const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const replyMiddleware = require("../middlewares/reply")

const routes = Router()
routes.use(authMiddleware)
// routes.use(replyMiddleware)

const replyComment = require("../views/video/comments/replyComment")

const listReplies = require("../views/video/comments/listReplies")

const delReply = require("../views/video/comments/delReply")

routes.post("/:comment", replyComment)

routes.get("/:comment", listReplies)

routes.delete("/:reply", delReply)

const loadReplyRoutes = (app) => app.use("/replys", routes)

module.exports = loadReplyRoutes

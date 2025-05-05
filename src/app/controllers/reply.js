const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const logMiddleware = require("../middlewares/log")
// const replyMiddleware = require("../middlewares/reply")

const routes = Router()
routes.use(authMiddleware)
// routes.use(logMiddleware)
// routes.use(replyMiddleware)

const replyComment = require("../views/video/comments/replyComment")
const delReply = require("../views/video/comments/delReply")

routes.post("/:comment", replyComment)

routes.delete("/:reply", delReply)

const loadReplyRoutes = (app) => app.use("/replys", routes)

module.exports = loadReplyRoutes

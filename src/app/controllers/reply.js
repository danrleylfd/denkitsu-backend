const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const replyMiddleware = require("../middlewares/reply")

const routes = Router()
routes.use(authMiddleware)
routes.use(replyMiddleware)

const replyComment = require("../views/video/comments/replyComment")
const delReply = require("../views/video/comments/delReply")

routes.post("/:video/:comment", replyComment)

routes.delete("/:video/:comment", delReply)

module.exports = (app) => app.use("/replys", routes)

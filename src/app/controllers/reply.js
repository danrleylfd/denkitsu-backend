const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const replyMiddleware = require("../middlewares/reply")

const routes = Router()
routes.use(authMiddleware)
routes.use(replyMiddleware)

const replyComment = require("../views/video/comments/replyComment")
const delReply = require("../views/video/comments/delReply")

console.log("NONE /replys...")

console.log("POST /replys/:video/:comment")
routes.post("/:video/:comment", replyComment)

console.log("DELETE /replys/:video/:comment")
routes.delete("/:video/:comment", delReply)

console.log("\nroutes /replys loaded.\n")
module.exports = app => app.use("/replys", routes)

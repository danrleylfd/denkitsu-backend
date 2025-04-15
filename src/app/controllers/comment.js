const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const commentMiddleware = require("../middlewares/comment")

const routes = Router()
routes.use(authMiddleware)
// routes.use(commentMiddleware)

const addComment = require("../views/video/comments/addComment")
const countComments = require("../views/video/comments/countComments")
const delComment = require("../views/video/comments/delComment")

console.log("NONE /comments...")

console.log("POST /:video")
routes.post("/:video", addComment)

console.log("GET /:video")
routes.get("/:video", countComments)

console.log("DEL /:video/:comment")
routes.delete("/:video/:comment", delComment)

console.log("routes /comments loaded.")
module.exports = (app) => app.use("/comments", routes)

const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const likeMiddleware = require("../middlewares/like")

const routes = Router()
routes.use(authMiddleware)
// routes.use(likeMiddleware)

const addLike = require("../views/video/likes/addLike")
const countLikes = require("../views/video/likes/countLikes")
const delLike = require("../views/video/likes/delLike")

console.log("NONE /likes...")

console.log("POST /likes/:video")
routes.post("/:video", addLike)

console.log("GET /likes/:video")
routes.get("/:video", countLikes)

console.log("DEL /likes/:video")
routes.delete("/:video", delLike)

console.log("\nroutes /likes loaded.\n")
module.exports = app => app.use("/likes", routes)

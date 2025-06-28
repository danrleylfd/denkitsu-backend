const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const videoMiddleware = require("../middlewares/video")

const routes = Router()
routes.use(authMiddleware)
// routes.use(videoMiddleware)

const addLike = require("../views/video/likes/addLike")
const countLikes = require("../views/video/likes/countLikes")
const delLike = require("../views/video/likes/delLike")

routes.post("/:video", videoMiddleware, addLike)

routes.get("/:video", videoMiddleware, countLikes)

routes.delete("/:video", videoMiddleware, delLike)

const loadLikeRoutes = (app) => app.use("/likes", routes)

module.exports = loadLikeRoutes

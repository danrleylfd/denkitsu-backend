const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")
const videoMiddleware = require("../middlewares/video")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)
routes.use(videoMiddleware)

const addLike = require("../views/video/likes/addLike")
const countLikes = require("../views/video/likes/countLikes")
const delLike = require("../views/video/likes/delLike")

routes.post("/:video", addLike)

routes.get("/:video", countLikes)

routes.delete("/:video", delLike)

const loadLikeRoutes = (app) => app.use("/likes", routes)

module.exports = loadLikeRoutes

const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")
// const likeMiddleware = require("../middlewares/like")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)
// routes.use(likeMiddleware)

const addLike = require("../views/video/likes/addLike")
const countLikes = require("../views/video/likes/countLikes")
const delLike = require("../views/video/likes/delLike")

routes.post("/:video", addLike)

routes.get("/:video", countLikes)

routes.delete("/:video", delLike)

module.exports = (app) => app.use("/likes", routes)

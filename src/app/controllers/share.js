const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")
const shareMiddleware = require("../middlewares/share")

const routes = Router()
routes.use(authMiddleware)
routes.use(logMiddleware)
routes.use(shareMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

routes.post("/:video", share)

routes.get("/:video", countShares)

module.exports = (app) => app.use("/shares", routes)

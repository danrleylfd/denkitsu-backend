const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")
const logMiddleware = require("../middlewares/log")

const routes = Router()
// routes.use(authMiddleware)
routes.use(logMiddleware)

const sendMessage = require("../views/message/sendMessage")

routes.post("/", sendMessage)

module.exports = (app) => app.use("/messages", routes)

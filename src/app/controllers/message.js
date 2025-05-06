const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(authMiddleware)
// routes.use(logMiddleware)

const sendMessage = require("../views/message/sendMessage")

routes.post("/", sendMessage)

const loadMessageRoutes = (app) => app.use("/chat/completions", routes)

module.exports = loadMessageRoutes

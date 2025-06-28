const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")

const routes = Router()
routes.use(authMiddleware)

const sendMessage = require("../views/message/sendMessage")
const getModels = require("../views/message/getModels")

routes.post("/chat/completions", sendMessage)

routes.get("/models", getModels)

const loadMessageRoutes = (app) => app.use("/ai", routes)

module.exports = loadMessageRoutes

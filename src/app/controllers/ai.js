const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")

const routes = Router()
// routes.use(authMiddleware)

const sendMessage = require("../views/ai/sendMsg")
const getModels = require("../views/ai/getModels")
const getPrompt = require("../views/ai/getPrompt")

routes.post("/chat/completions", sendMessage)

routes.get("/models", getModels)

routes.get("/prompt", getPrompt)

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

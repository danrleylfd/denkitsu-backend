const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const routes = Router()
// routes.use(authMiddleware)

const sendMessage = require("../views/ai/sendMessage")
const getModels = require("../views/ai/getModels")
const getPrompt = require("../views/ai/getPrompt")

routes.post("/chat/completions", aiMiddleware, sendMessage)

routes.get("/models", getModels)

routes.get("/prompt", getPrompt)

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

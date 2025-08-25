const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const validate = require("../middlewares/validator")
const { sendMessageRules } = require("../validators/ai")

const routes = Router()
routes.use(authMiddleware)

const sendWithStream = require("../views/ai/sendWithStream")
const sendWithoutStream = require("../views/ai/sendWithoutStream")
// const sendMessage = require("../views/ai/sendMsg")
const getModels = require("../views/ai/getModels")
const listAgents = require("../views/ai/listAgents")
const listTools = require("../views/ai/listTools")

const sendMessage = (req, res, next) => {
  const { stream = false } = req.body
  if (stream) return sendWithStream(req, res, next)
  return sendWithoutStream(req, res, next)
}

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, sendMessage)

routes.get("/models", getModels)

routes.get("/agents", listAgents)

routes.get("/tools", listTools)

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

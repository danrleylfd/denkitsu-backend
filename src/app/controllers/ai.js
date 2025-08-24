const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const validate = require("../middlewares/validator")
const { sendMessageRules } = require("../validators/ai")

const routes = Router()
routes.use(authMiddleware)

const sendWithStream = require("../views/ai/handlers/sendWithStream")
const sendWithoutStream = require("../views/ai/handlers/sendWithoutStream")
// const sendMessage = require("../views/ai/sendMsg")
const getModels = require("../views/ai/getModels")

const sendMessage = (req, res, next) => {
  const { stream = false } = req.body
  if (stream) return sendWithStream(req, res, next)
  return sendWithoutStream(req, res, next)
}

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, sendMessage)

routes.get("/models", getModels)

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

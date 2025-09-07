const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { sendMessageRules } = require("../validators/ai")

const { handleOpenAIStream } = require("../views/ai/sendWithStream")
const { handleOpenAINonStream } = require("../views/ai/sendWithoutStream")
const getModels = require("../views/ai/getModels")
const listAgents = require("../views/ai/listAgents")
const listTools = require("../views/ai/listTools")

const routes = Router()
routes.use(authMiddleware)

const sendMessage = (req, res, next) => {
  const { stream = false } = req.body
  if (stream) return handleOpenAIStream(req, res, next)
  return handleOpenAINonStream(req, res, next)
}

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, asyncHandler(sendMessage))

routes.get("/models", asyncHandler(getModels))
routes.get("/agents", asyncHandler(listAgents))
routes.get("/tools", asyncHandler(listTools))

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

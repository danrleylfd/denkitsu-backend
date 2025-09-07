const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { sendMessageRules } = require("../validators/ai")
const createAppError = require("../../utils/errors")

const routes = Router()
routes.use(authMiddleware)

const { handleOpenAIStream } = require("../views/ai/sendWithStream")
const { handleOpenAINonStream } = require("../views/ai/sendWithoutStream")
const getModels = require("../views/ai/getModels")
const listAgents = require("../views/ai/listAgents")
const listTools = require("../views/ai/listTools")

const sendMessage = (req, res, next) => {
  const { user } = req
  const { aiProvider = "groq", stream = false } = req.body

  if (aiProvider === "custom" && user.plan === "free") {
    return next(createAppError("O provedor de IA personalizado é um recurso exclusivo para membros Plus.", 403, "PLUS_PLAN_REQUIRED"))
  }

  try {
    if (stream) {
      return handleOpenAIStream(req, res, next)
    } else {
      return handleOpenAINonStream(req, res, next)
    }
  } catch(error) {
    next(error)
  }
}

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, asyncHandler(sendMessage))

routes.get("/models", asyncHandler(getModels))

routes.get("/agents", asyncHandler(listAgents))

routes.get("/tools", asyncHandler(listTools))

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

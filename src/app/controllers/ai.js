// Arquivo: Backend/src/app/controllers/ai.js

const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { sendMessageRules } = require("../validators/ai")
const { prepareInitialAIRequest } = require("../middlewares/aiRequestSequence") // MODIFICADO: Reutilizado e simplificado
const aiMiddleware = require("../middlewares/ai")
const createAppError = require("../../utils/errors")

// ADICIONADO: Nova view unificada
const handleStreamingLifecycle = require("../views/ai/handleStreamLifecycle")
const handleNonStreamingLifecycle = require("../views/ai/handleNonStreamLifecycle") // ADICIONADO: Handler para não-streaming
const getModels = require("../views/ai/getModels")
const listAgents = require("../views/ai/listAgents")
const listTools = require("../views/ai/listTools")

const routes = Router()
routes.use(authMiddleware)

// ROTA UNIFICADA
const sendMessage = (req, res, next) => {
  const { user } = req
  const { stream = false } = req.body

  if (req.body.aiProvider === "custom" && user.plan === "free") {
    return next(createAppError("O provedor de IA personalizado é um recurso exclusivo para membros Plus.", 403, "PLUS_PLAN_REQUIRED"))
  }

  // MODIFICADO: Roteia para o handler correto com base no stream
  if (stream) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    return handleStreamingLifecycle(req, res, next)
  } else {
    return handleNonStreamingLifecycle(req, res, next)
  }
}

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, prepareInitialAIRequest, asyncHandler(sendMessage))
routes.get("/models", asyncHandler(getModels))
routes.get("/agents", asyncHandler(listAgents))
routes.get("/tools", asyncHandler(listTools))

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

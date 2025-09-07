const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const aiMiddleware = require("../middlewares/ai")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const proOnly = require("../middlewares/subscription")
const aiRouter = require("../middlewares/aiRouter")
const { sendMessageRules } = require("../validators/ai")
const { prepareInitialAIRequest, makePrimaryAIRequest, handleToolCalls } = require("../middlewares/aiRequestSequence")

const handleStreamLifecycle = require("../views/ai/handleStreamLifecycle")
const finalizeAndSendResponse = require("../views/ai/finalizeAndSendResponse")
const handleGeminiStream = require("../views/ai/handleGeminiStream")
const handleGeminiNonStream = require("../views/ai/handleGeminiNonStream")
const getModels = require("../views/ai/getModels")
const listAgents = require("../views/ai/listAgents")
const listTools = require("../views/ai/listTools")

const routes = Router()
routes.use(authMiddleware)

routes.post("/chat/completions", sendMessageRules(), validate, aiMiddleware, aiRouter)

routes.post("/chat/groq/stream", asyncHandler(prepareInitialAIRequest), asyncHandler(handleStreamLifecycle))
routes.post(
  "/chat/groq/nonstream",
  asyncHandler(prepareInitialAIRequest),
  asyncHandler(makePrimaryAIRequest),
  asyncHandler(handleToolCalls),
  asyncHandler(finalizeAndSendResponse)
)

routes.post("/chat/openrouter/stream", asyncHandler(prepareInitialAIRequest), asyncHandler(handleStreamLifecycle))
routes.post(
  "/chat/openrouter/nonstream",
  asyncHandler(prepareInitialAIRequest),
  asyncHandler(makePrimaryAIRequest),
  asyncHandler(handleToolCalls),
  asyncHandler(finalizeAndSendResponse)
)

routes.post("/chat/custom/stream", proOnly, asyncHandler(prepareInitialAIRequest), asyncHandler(handleStreamLifecycle))
routes.post(
  "/chat/custom/nonstream",
  proOnly,
  asyncHandler(prepareInitialAIRequest),
  asyncHandler(makePrimaryAIRequest),
  asyncHandler(handleToolCalls),
  asyncHandler(finalizeAndSendResponse)
)

routes.post("/chat/gemini/stream", asyncHandler(handleGeminiStream))
routes.post("/chat/gemini/nonstream", asyncHandler(handleGeminiNonStream))

routes.get("/models", asyncHandler(getModels))
routes.get("/agents", asyncHandler(listAgents))
routes.get("/tools", asyncHandler(listTools))

const loadAIRoutes = (app) => app.use("/ai", routes)

module.exports = loadAIRoutes

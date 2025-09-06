const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const {
  agentIdInParams,
  createOrUpdateAgentRules,
  acquireAgentIdInParams
} = require("../validators/agent")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/agent/createOne")
const readMany = require("../views/agent/readMany")
const updateOne = require("../views/agent/updateOne")
const deleteOne = require("../views/agent/deleteOne")
const readPublished = require("../views/agent/readPublished")
const acquireOne = require("../views/agent/acquireOne")
const unacquireOne = require("../views/agent/unacquireOne")

routes.post("/", createOrUpdateAgentRules(), validate, asyncHandler(createOne))

routes.get("/", asyncHandler(readMany))

routes.put("/:agentId", agentIdInParams(), createOrUpdateAgentRules(), validate, asyncHandler(updateOne))

routes.delete("/:agentId", agentIdInParams(), validate, asyncHandler(deleteOne))

routes.post("/store/:agentId/acquire", acquireAgentIdInParams(), validate, asyncHandler(acquireOne))

routes.get("/store", asyncHandler(readPublished))

routes.delete("/store/:agentId/acquire", acquireAgentIdInParams(), validate, asyncHandler(unacquireOne))

const loadAgentRoutes = (app) => app.use("/agents", routes)

module.exports = loadAgentRoutes

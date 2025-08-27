const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
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

routes.get("/store", readPublished)
routes.post("/store/:agentId/acquire", acquireAgentIdInParams(), validate, acquireOne)

routes.post("/", createOrUpdateAgentRules(), validate, createOne)
routes.get("/", readMany)
routes.put("/:agentId", agentIdInParams(), createOrUpdateAgentRules(), validate, updateOne)
routes.delete("/:agentId", agentIdInParams(), validate, deleteOne)

const loadAgentRoutes = (app) => app.use("/agents", routes)

module.exports = loadAgentRoutes

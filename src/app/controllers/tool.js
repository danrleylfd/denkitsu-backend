const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const {
  createToolRules,
  updateToolRules,
  toolIdInParams,
  acquireToolIdInParams
} = require("../validators/tool")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/tool/createOne")
const readMany = require("../views/tool/readMany")
const updateOne = require("../views/tool/updateOne")
const deleteOne = require("../views/tool/deleteOne")
const readPublished = require("../views/tool/readPublished")
const acquireOne = require("../views/tool/acquireOne")
const unacquireOne = require("../views/tool/unacquireOne")

routes.post("/", createToolRules(), validate, asyncHandler(createOne))

routes.get("/", asyncHandler(readMany))

routes.put("/:toolId", updateToolRules(), validate, asyncHandler(updateOne))

routes.delete("/:toolId", toolIdInParams(), validate, asyncHandler(deleteOne))

routes.post("/store/:toolId/acquire", acquireToolIdInParams(), validate, asyncHandler(acquireOne))

routes.get("/store", asyncHandler(readPublished))

routes.delete("/store/:toolId/acquire", acquireToolIdInParams(), validate, asyncHandler(unacquireOne))

const loadToolRoutes = (app) => app.use("/tools", routes)

module.exports = loadToolRoutes

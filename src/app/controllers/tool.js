const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const validate = require("../middlewares/validator")
const {
  createToolRules,
  updateToolRules,
  toolIdInParams,
} = require("../validators/tool")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/tool/createOne")
const readMany = require("../views/tool/readMany")
const updateOne = require("../views/tool/updateOne")
const deleteOne = require("../views/tool/deleteOne")

routes.post("/", createToolRules(), validate, createOne)
routes.get("/", readMany)
routes.put("/:toolId", updateToolRules(), validate, updateOne)
routes.delete("/:toolId", toolIdInParams(), validate, deleteOne)

const loadToolRoutes = (app) => app.use("/tools", routes)

module.exports = loadToolRoutes

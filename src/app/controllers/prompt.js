const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")

const validate = require("../middlewares/validator")

const { promptRules, promptIdRules } = require("../validators/prompt")

const createOne = require("../views/prompt/createOne")
const readMany = require("../views/prompt/readMany")
const updateOne = require("../views/prompt/updateOne")
const deleteOne = require("../views/prompt/deleteOne")

const routes = Router()
routes.use(authMiddleware)

routes.post("/", promptRules(), validate, createOne)

routes.get("/", readMany)

routes.put("/:promptId", promptIdRules(), promptRules(), validate, updateOne)

routes.delete("/:promptId", promptIdRules(), validate, deleteOne)

const loadPromptRoutes = (app) => app.use("/prompts", routes)

module.exports = loadPromptRoutes

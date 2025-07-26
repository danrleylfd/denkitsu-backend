const { Router } = require("express")

const validate = require("../middlewares/validator")
const { readOneRules } = require("../validators/linker")

const routes = Router()

const readOne = require("../views/linker/readOne")

routes.get("/:label", readOneRules(), validate, readOne)

const loadAccessRoutes = (app) => app.use("/access", routes)

module.exports = loadAccessRoutes

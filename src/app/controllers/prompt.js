const { Router } = require("express")

const routes = Router()

const getPrompt = require("../views/prompt/readOne")

routes.get("/", getPrompt)

const loadPromptRouter = (app) => app.use("/prompt", routes)

module.exports = loadPromptRouter

const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const fetchRepo = require("../views/github/fetchRepo")

const routes = Router()
routes.use(authMiddleware)

routes.get("/repo-content", fetchRepo)

const loadGithubRoutes = (app) => app.use("/github", routes)

module.exports = loadGithubRoutes

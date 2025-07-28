const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")

const fetchRepoFiles = require("../views/github/fetchRepoFiles")
const generateCodebase = require("../views/github/generateCodebase")

const routes = Router()
routes.use(authMiddleware)

routes.get("/repo-files", fetchRepoFiles)

routes.post("/generate-codebase", generateCodebase)

const loadGithubRoutes = (app) => app.use("/github", routes)

module.exports = loadGithubRoutes

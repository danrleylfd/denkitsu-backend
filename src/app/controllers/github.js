const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { fetchRepoRules } = require("../validators/github")

const fetchRepoFiles = require("../views/github/fetchRepoFiles")
const generateCodebase = require("../views/github/generateCodebase")

const routes = Router()
routes.use(authMiddleware)

routes.get("/repo-files", fetchRepoRules(), validate, asyncHandler(fetchRepoFiles))

routes.post("/generate-codebase", asyncHandler(generateCodebase))

const loadGithubRoutes = (app) => app.use("/github", routes)

module.exports = loadGithubRoutes

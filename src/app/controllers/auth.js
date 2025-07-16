const { Router } = require("express")

const routes = Router()

const signUp = require("../views/auth/signUp")
const signIn = require("../views/auth/signIn")
const refreshToken = require("../views/auth/refreshToken")
const forgotPassword = require("../views/auth/forgotPassword")
const resetPassword = require("../views/auth/resetPassword")
const githubRedirect = require("../views/auth/githubRedirect") // NOVO
const githubCallback = require("../views/auth/githubCallback") // NOVO

routes.post("/signup", signUp)

routes.post("/signin", signIn)

routes.post("/refresh_token", refreshToken)

routes.post("/forgot_password", forgotPassword)

routes.post("/reset_password", resetPassword)

routes.get("/github", githubRedirect)

routes.get("/github/callback", githubCallback)

const loadAuthRoutes = (app) => app.use("/auth", routes)

module.exports = loadAuthRoutes

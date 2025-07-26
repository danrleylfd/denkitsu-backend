const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const {
  signUpRules,
  signInRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
} = require("../validators/auth")

const routes = Router()

const signUp = require("../views/auth/signUp")
const signIn = require("../views/auth/signIn")
const refreshToken = require("../views/auth/refreshToken")
const forgotPassword = require("../views/auth/forgotPassword")
const resetPassword = require("../views/auth/resetPassword")
const githubRedirect = require("../views/auth/githubRedirect")
const githubCallback = require("../views/auth/githubCallback")
const githubConnect = require("../views/auth/githubConnect")

routes.post("/signup", signUpRules(), validate, signUp)

routes.post("/signin", signInRules(), validate, signIn)

routes.post("/refresh_token", refreshTokenRules(), validate, refreshToken)

routes.post("/forgot_password", forgotPasswordRules(), validate, forgotPassword)

routes.post("/reset_password", resetPasswordRules(), validate, resetPassword)

routes.get("/github", githubRedirect)

routes.get("/github/connect", authMiddleware, githubConnect)

routes.get("/github/callback", githubCallback)

const loadAuthRoutes = (app) => app.use("/auth", routes)

module.exports = loadAuthRoutes

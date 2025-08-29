const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
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

routes.post("/signup", signUpRules(), validate, asyncHandler(signUp))

routes.post("/signin", signInRules(), validate, asyncHandler(signIn))

routes.post("/refresh_token", refreshTokenRules(), validate, asyncHandler(refreshToken))

routes.post("/forgot_password", forgotPasswordRules(), validate, asyncHandler(forgotPassword))

routes.post("/reset_password", resetPasswordRules(), validate, asyncHandler(resetPassword))

routes.get("/github", asyncHandler(githubRedirect))

routes.get("/github/connect", authMiddleware, asyncHandler(githubConnect))

routes.get("/github/callback", asyncHandler(githubCallback))

const loadAuthRoutes = (app) => app.use("/auth", routes)

module.exports = loadAuthRoutes

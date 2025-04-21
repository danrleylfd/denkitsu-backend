const { Router } = require("express")

const routes = Router()

const signUp = require("../views/auth/signUp")
const signIn = require("../views/auth/signIn")
const refreshToken = require("../views/auth/refreshToken")
const forgotPassword = require("../views/auth/forgotPassword")
const resetPassword = require("../views/auth/resetPassword")

routes.post("/signup", signUp)

routes.post("/signin", signIn)

routes.post("/refresh_token", refreshToken)

routes.post("/forgot_password", forgotPassword)

routes.post("/reset_password", resetPassword)

module.exports = (app) => app.use("/auth", routes)

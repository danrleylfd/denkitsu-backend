const { Router } = require("express")
const routes = Router()

const signUp = require("../views/auth/signUp")
const signIn = require("../views/auth/signIn")
const forgotPassword = require("../views/auth/forgotPassword")
const resetPassword = require("../views/auth/resetPassword")
const getUser = require("../views/auth/getUser")
const editAccount = require("../views/auth/editAccount")
const deleteAccount = require("../views/auth/deleteAccount")

routes.post("/signup", signUp)

routes.post("/signin", signIn)

routes.post("/forgot_password", forgotPassword)

routes.post("/reset_password", resetPassword)

routes.get("/", getUser)

routes.get("/:userID", getUser)

routes.put("/", editAccount)

routes.delete("/", deleteAccount)

module.exports = app => app.use("/auth", routes)

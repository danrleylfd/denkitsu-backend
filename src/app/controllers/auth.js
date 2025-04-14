const { Router } = require("express")
const routes = Router()

const signUp = require("../views/auth/signUp")
const signIn = require("../views/auth/signIn")
const forgotPassword = require("../views/auth/forgotPassword")
const resetPassword = require("../views/auth/resetPassword")
const getUser = require("../views/auth/getUser")
const editAccount = require("../views/auth/editAccount")
const deleteAccount = require("../views/auth/deleteAccount")

console.log("NONE /auth...")

console.log("POST /auth/signUp")
routes.post("/signup", signUp)

console.log("POST /auth/signIn")
routes.post("/signin", signIn)

console.log("POST /auth/forgotPassword")
routes.post("/forgot_password", forgotPassword)

console.log("POST /auth/resetPassword")
routes.post("/reset_password", resetPassword)

console.log("GET /auth/getUser")
routes.get("/", getUser)

console.log("GET /auth/getUser/:id")
routes.get("/:id", getUser)

console.log("PUT /auth/editAccount")
routes.put("/", editAccount)

console.log("DEL /auth/deleteAccount")
routes.delete("/", deleteAccount)

console.log("\nroutes /auth loaded.\n")
module.exports = (app) => app.use("/auth", routes)

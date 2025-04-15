const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")

const routes = Router()
// routes.use(authMiddleware)

const sendMessage = require("../views/message/sendMessage")

console.log("NONE /message...")

console.log("POST /message")
routes.post("/", sendMessage)

console.log("\nroutes /message loaded.\n")
module.exports = (app) => app.use("/messages", routes)

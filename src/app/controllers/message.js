const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")

const routes = Router()
// routes.use(authMiddleware)

const sendMessage = require("../views/message/sendMessage")

console.log("NONE /messages...")

console.log("POST /")
routes.post("/", sendMessage)

console.log("\nroutes /message loaded.\n")
module.exports = (app) => app.use("/messages", routes)

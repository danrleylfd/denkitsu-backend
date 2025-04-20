const { Router } = require("express")
// const authMiddleware = require("../middlewares/auth")

const routes = Router()
// routes.use(authMiddleware)

const sendMessage = require("../views/message/sendMessage")

routes.post("/", sendMessage)

module.exports = (app) => app.use("/messages", routes)

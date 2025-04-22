const { Router } = require("express")
const logMiddleware = require("../middlewares/log")

const routes = Router()
routes.use(logMiddleware)

const sendMessage = require("../views/message/sendMessage")

routes.post("/", sendMessage)

module.exports = (app) => app.use("/messages", routes)

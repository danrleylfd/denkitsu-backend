const { Router } = require("express")
const routes = Router()

const readLogs = require("../views/dashboard/readLogs")

routes.get("/logs", readLogs)

module.exports = (app) => app.use("/dashboard", routes)

const { Router } = require("express")
const ownerMiddleware = require("../middlewares/owner")

const routes = Router()
routes.use(ownerMiddleware)

const readLogs = require("../views/dashboard/readLogs")

routes.get("/logs", readLogs)

module.exports = (app) => app.use("/dashboard", routes)

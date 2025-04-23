const { Router } = require("express")
const ownerMiddleware = require("../middlewares/owner")

const routes = Router()
routes.use(ownerMiddleware)

const readLogs = require("../views/dashboard/readLogs")

routes.get("/logs", readLogs)

const loadDashboardRoutes = (app) => app.use("/dashboard", routes)

module.exports = loadDashboardRoutes

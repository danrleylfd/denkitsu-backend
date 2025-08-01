const { Router } = require("express")

const routes = Router()



const loadMCPRoutes = (app) => app.use("/mcp", routes)

module.exports = loadMCPRoutes

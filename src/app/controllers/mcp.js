const { Router } = require("express")

const listResources = require("../views/mcp/listResources")
const getResource = require("../views/mcp/getResource")
const executeResource = require("../views/mcp/executeResource")

const routes = Router()

routes.get("/", listResources)

routes.get("/resources/:resourceId", getResource)

routes.post("/resources/:resourceId/execute", executeResource)

const loadMCPRoutes = (app) => app.use("/mcp", routes)

module.exports = loadMCPRoutes

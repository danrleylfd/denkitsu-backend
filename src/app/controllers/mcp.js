const { Router } = require("express")

const routes = Router()

routes.get("/", async (req, res) => {
  return res.status(200).json({ ok: 200 })
})

const loadMCPRoutes = (app) => app.use("/mcp", routes)

module.exports = loadMCPRoutes

const { Router } = require("express")
const routes = Router()

const getAPI = require("../views/external/index")

console.log("NONE /external...")

console.log("GET /external/")
routes.get("/", getAPI)

console.log("\nroutes /external loaded.\n")
module.exports = app => app.use("/external", routes)

const { Router } = require("express")
const routes = Router()

const readOne = require("../views/linker/readOne")

console.log("NONE /...")

console.log("GET /:label")
routes.get("/:label", readOne)

console.log("\nroutes / loaded.\n")
module.exports = (app) => app.use("/", routes)

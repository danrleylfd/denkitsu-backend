const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/linker/createOne")
const readMany = require("../views/linker/readMany")
const updateOne = require("../views/linker/updateOne")
const deleteOne = require("../views/linker/deleteOne")

console.log("NONE /linkers...")

console.log("GET /linkers/")
routes.post("/", createOne)

console.log("GET /linkers/")
routes.get("/", readMany)

console.log("GET /linkers/by-user")
routes.get("/by-user", readMany)

console.log("GET /linkers/:label")
routes.get("/:label", readMany)

console.log("PUT /linkers/:oldLabel")
routes.put("/:oldLabel", updateOne)

console.log("DEL /linkers/:label")
routes.delete("/:label", deleteOne)

console.log("\nlinkers routes loaded.\n")
module.exports = (app) => app.use("/linkers", routes)

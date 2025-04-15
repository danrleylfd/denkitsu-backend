const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/video/createOne")
const readRecents = require("../views/video/readRecents")
const readPopular = require("../views/video/readPopular")
const readOne = require("../views/video/readOne")
const updateOne = require("../views/video/updateOne")
const deleteOne = require("../views/video/deleteOne")

console.log("NONE /videos...")

console.log("POST /videos")
routes.post("/", createOne)

console.log("GET /videos/one/:video")
routes.get("/one/:video", readOne)

console.log("GET /videos/popular")
routes.get("/popular", readPopular)

console.log("GET /videos/recents")
routes.get("/recents", readRecents)

console.log("PUT /videos/:video")
routes.put("/:video", updateOne)

console.log("DEL /videos/:video")
routes.delete("/:video", deleteOne)

console.log("\nroutes /videos loaded.\n")
module.exports = (app) => app.use("/videos", routes)

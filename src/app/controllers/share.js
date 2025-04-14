const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
// const shareMiddleware = require("../middlewares/share")

const routes = Router()
routes.use(authMiddleware)
// routes.use(shareMiddleware)

const share = require("../views/video/shares/share")
const countShares = require("../views/video/shares/countShares")

console.log("NONE /shares...")

console.log("POST /shares/:video")
routes.post("/:video", share)

console.log("GET /shares/:video")
routes.get("/:video", countShares)

console.log("\nroutes /shares loaded.\n")
module.exports = app => app.use("/shares", routes)

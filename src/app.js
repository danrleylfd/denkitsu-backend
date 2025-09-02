require("dotenv").config({ path: __dirname + "/../.env" })
const express = require("express")
const requestIp = require("request-ip")
const cors = require("./app/middlewares/cors")
const { globalLimiter, authLimiter } = require("./app/middlewares/rateLimiter")
const errorHandler = require("./app/middlewares/errorHandler")
const asyncHandler = require("./app/middlewares/asyncHandler")
const stripeWebhook = require("./app/views/stripe/webhook")

const app = express()

app.post("/stripe/webhook", express.raw({ type: "application/json" }), asyncHandler(stripeWebhook))

app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestIp.mw())
app.use(globalLimiter)
app.use(authLimiter)
require("./app/controllers/index")(app)
app.use(errorHandler)

app.listen(process.env.PORT)

console.log("Servidor inicializado.")

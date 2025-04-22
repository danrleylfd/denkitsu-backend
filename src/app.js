require("dotenv").config({ path: __dirname + "/../.env" })
const express = require("express")
const requestIp = require("request-ip")
const cors = require("./app/middlewares/cors")
const { globalLimiter, authLimiter } = require("./app/middlewares/rateLimiter")

const app = express()

app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestIp.mw())
app.use(globalLimiter)
app.use(authLimiter)

require("./app/controllers/index")(app)

app.listen(process.env.PORT)

console.log("Servidor inicializado.")

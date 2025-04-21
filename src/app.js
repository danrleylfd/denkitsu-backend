require("dotenv").config({ path: __dirname + "/../.env" })
const express = require("express")
const app = express()
const cors = require("./app/middlewares/cors")
const logMiddleware = require("./app/middlewares/log")

app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logMiddleware)

require("./app/controllers/index")(app)

app.listen(process.env.PORT)

console.log("Servidor inicializado.")

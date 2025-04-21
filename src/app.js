require("dotenv").config({ path: __dirname + "/../.env" })
const express = require("express")
const app = express()
const cors = require("./app/middlewares/cors")

app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

require("./app/controllers/index")(app)

app.listen(process.env.PORT)

console.log("Servidor inicializado.")

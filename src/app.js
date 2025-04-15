require("dotenv").config({ path: __dirname + "/../.env" })
const express = require("express")
const app = express()
const cors = require("cors")

const allowedOrigins = [
  process.env.HOST1,
  process.env.HOST2,
  process.env.HOST3,
  process.env.HOST4,
  process.env.HOST5,
  process.env.HOST6
]

app.use(cors({ origin: (origin, callback) => {
  if(!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
  } else {
    callback(new Error("Not allowed by CORS"))
  }
} }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

require("./app/controllers/index")(app)

app.listen(process.env.PORT)

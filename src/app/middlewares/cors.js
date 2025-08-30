const cors = require("cors")

module.exports = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.HOST0,
      process.env.HOST1,
      process.env.HOST2,
      process.env.HOST3,
      process.env.HOST4,
    ]
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error("Not allowed by CORS"))
  }
})

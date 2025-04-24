const cors = require("cors")

module.exports = cors({
  origin: (origin, callback) => {
    console.log(`origin: ${origin}`)
    const allowedOrigins = [
      process.env.HOST0,
      process.env.HOST1,
      process.env.HOST2,
      process.env.HOST3,
      process.env.HOST4,
      process.env.HOST5,
      process.env.HOST6,
      process.env.HOST7,
      process.env.HOST8,
      process.env.HOST9,
      process.env.HOST10
    ]
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error("Not allowed by CORS"))
  }
})

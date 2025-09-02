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
    const referer = callback.req.headers.referer
    let refererOrigin = null
    if (referer) {
      try {
        refererOrigin = new URL(referer).origin
      } catch (error) {
        console.warn("Could not parse referer URL:", referer)
      }
    }
    const requestOrigin = origin || refererOrigin
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) callback(null, true)
    else callback(new Error(`Not allowed by CORS. Origin: ${requestOrigin}`))
  }
})

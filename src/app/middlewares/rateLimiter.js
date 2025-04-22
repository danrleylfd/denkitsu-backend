const rateLimit = require("express-rate-limit")
const { RATE_LIMIT_WINDOW = 15, RATE_LIMIT_MAX = 1000 } = process.env

const baseOptions = {
  windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.clientIp,
  message: { error: "Too many requests, please try again later after 15 minutes." }
}

const globalLimiter = rateLimit({
  ...baseOptions,
  max: RATE_LIMIT_MAX,
  skip: req => req.path.includes("/dashboard")
})

const authLimiter = rateLimit({
  ...baseOptions,
  max: 45,
  skip: req => !req.path.includes("/auth")
})

module.exports = { globalLimiter, authLimiter }

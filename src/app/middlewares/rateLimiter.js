const rateLimit = require("express-rate-limit")
const { RATE_LIMIT_WINDOW = 1, RATE_LIMIT_MAX = 100 } = process.env

const blockHistory = new Map()

const getBlockDuration = (ip) => {
  const history = blockHistory.get(ip) || 0
  if (history >= 3) return 180 * 60 * 1000
  return RATE_LIMIT_WINDOW * 60 * 1000
}

const baseOptions = {
  windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.clientIp,
  handler: (req, res, next, options) => {
    const ip = req.clientIp
    blockHistory.set(ip, (blockHistory.get(ip) || 0) + 1)
    options.windowMs = getBlockDuration(ip)
    res.status(429).json({
      error: { code: "RATE_LIMIT", message: `Muitas requisições. Por favor, tente novamente em ${options.windowMs / (60 * 1000)} minutos.`},
      nextValidRequest: new Date(Date.now() + options.windowMs)
    })
  },
  message: { error: { code: "RATE_LIMIT", message: "Muitas requisições. Por favor, tente novamente em 1 minuto." } }
}

const globalLimiter = rateLimit({
  ...baseOptions,
  max: RATE_LIMIT_MAX,
  skip: req => req.path.includes("/dashboard")
})

const authLimiter = rateLimit({
  ...baseOptions,
  max: 15,
  skip: req => !req.path.includes("/auth")
})

setInterval(() => {
  blockHistory.clear()
}, 24 * 60 * 60 * 1000)

module.exports = { globalLimiter, authLimiter }

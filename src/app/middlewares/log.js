const Log = require("../models/log")

module.exports = async (req, res, next) => {
  try {
    const ip = req.clientIp
    const so = getOS(req.headers["user-agent"])
    const browser = getBrowser(req.headers["user-agent"])
    const route = req.originalUrl
    const user = req.userID || null
    const log = await Log.create({ ip, so, browser, route, user })
    if (!log) throw new Error("LOG_NOT_CREATED")
    next()
  } catch (error) {
    console.error(`[LOG_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[LOG_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LOG_NOT_CREATED: { status: 422, message: "Log not created" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

function getOS(userAgent) {
  if (/windows/i.test(userAgent)) return "Windows"
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac OS"
  if (/linux/i.test(userAgent)) return "Linux"
  return "Desconhecido"
}

function getBrowser(userAgent) {
  if (/chrome|crios|crmo/i.test(userAgent)) return "Chrome"
  if (/firefox|fxios/i.test(userAgent)) return "Firefox"
  if (/safari/i.test(userAgent)) return "Safari"
  if (/msie|trident/i.test(userAgent)) return "Internet Explorer"
  return "Desconhecido"
}

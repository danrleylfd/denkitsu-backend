const Log = require("../models/log")

module.exports = async (req, res, next) => {
  try {
    const user = req.userID || null
    const ip = req.ip || req.connection.remoteAddress
    const so = getOS(req.headers["user-agent"])
    const browser = getBrowser(req.headers["user-agent"])
    const route = req.originalUrl
    await Log.create({ ip, so, browser, route, user })
    next()
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
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

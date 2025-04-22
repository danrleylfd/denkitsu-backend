const { verify } = require("jsonwebtoken")

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new Error("TOKEN_MISSING")

    const parts = authHeader.split(" ")
    if (parts.length !== 2) throw new Error("TOKEN_PARTS_ERROR")

    const [scheme, token] = parts
    if (!/^Bearer$/i.test(scheme)) throw new Error("TOKEN_SCHEMA_ERROR")

    verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) throw new Error("TOKEN_INVALID")
      req.userID = decoded.id
      return next()
    })
  } catch (error) {
    console.error(`[AUTH_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[AUTH_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      TOKEN_MISSING: { status: 401, message: "No token provided" },
      TOKEN_PARTS_ERROR: { status: 401, message: "Invalid token format" },
      TOKEN_SCHEMA_ERROR: { status: 401, message: "Token must use Bearer scheme" },
      TOKEN_INVALID: { status: 401, message: "Invalid or expired token" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

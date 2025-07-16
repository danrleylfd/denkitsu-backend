const { verify } = require("jsonwebtoken")
const User = require("../models/auth")

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const queryToken = req.query.token

    let token

    if (authHeader) {
      const parts = authHeader.split(" ")
      if (parts.length !== 2) throw new Error("TOKEN_PARTS_ERROR")
      const [scheme, headerToken] = parts
      if (!/^Bearer$/i.test(scheme)) throw new Error("TOKEN_SCHEMA_ERROR")
      token = headerToken
    } else if (queryToken) {
      token = queryToken
    } else {
      throw new Error("TOKEN_MISSING")
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    if (!decoded) throw new Error("TOKEN_INVALID")

    const user = await User.findById(decoded.id).select("_id")
    if (!user) throw new Error("USER_NOT_FOUND")

    req.userID = user._id
    return next()
  } catch (error) {
    console.error(`[AUTH_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[AUTH_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      TOKEN_MISSING: { status: 401, message: "No token provided" },
      TOKEN_PARTS_ERROR: { status: 401, message: "Invalid token format" },
      TOKEN_SCHEMA_ERROR: { status: 401, message: "Token must use Bearer scheme" },
      TOKEN_INVALID: { status: 401, message: "Invalid or expired token" },
      USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = authMiddleware

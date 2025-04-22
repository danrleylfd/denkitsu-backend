const { verify } = require("jsonwebtoken")

const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new Error("REFRESH_TOKEN_MISSING")

    const parts = refreshToken.split(" ")
    if (parts.length !== 2) throw new Error("REFRESH_TOKEN_PARTS_ERROR")

    const [scheme, refToken] = parts
    if (!/^Bearer$/i.test(scheme)) throw new Error("REFRESH_TOKEN_SCHEMA_ERROR")

    verify(refToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) throw new Error("REFRESH_TOKEN_INVALID")
      const newRefreshToken = generateRefreshToken({ id: decoded.id })
      const newToken = generateToken({ id: decoded.id })
      return res.status(200).json({ refreshToken: newRefreshToken, token: newToken })
    })
  } catch (error) {
    console.error(`[REFRESH_TOKEN] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[REFRESH_TOKEN] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      REFRESH_TOKEN_MISSING: { status: 401, message: "No refresh token provided" },
      REFRESH_TOKEN_PARTS_ERROR: { status: 401, message: "Invalid refresh token format" },
      REFRESH_TOKEN_SCHEMA_ERROR: { status: 401, message: "refresh token must use Bearer scheme" },
      REFRESH_TOKEN_INVALID: { status: 401, message: "Invalid or expired refresh token" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

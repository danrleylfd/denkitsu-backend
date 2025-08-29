const { verify } = require("jsonwebtoken")
const { generateToken, generateRefreshToken } = require("../../../utils/api/auth")

const createAppError = require("../../../utils/errors")

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const [, token] = refreshToken.split(" ")
    const decoded = verify(token, process.env.JWT_REFRESH_SECRET)
    const newRefreshToken = generateRefreshToken({ id: decoded.id })
    const newToken = generateToken({ id: decoded.id })
    return res.status(200).json({ refreshToken: newRefreshToken, token: newToken })
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") throw createAppError("O refresh token é inválido ou expirou.", 401, "REFRESH_TOKEN_INVALID")
    throw error
  }
}

module.exports = refreshToken

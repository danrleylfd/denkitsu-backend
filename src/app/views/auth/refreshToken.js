const { verify, JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken")
const { generateToken, generateRefreshToken } = require("../../../utils/api/auth")

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const [, token] = refreshToken.split(" ")
    const decoded = verify(token, process.env.JWT_REFRESH_SECRET)
    const newRefreshToken = generateRefreshToken({ id: decoded.id })
    const newToken = generateToken({ id: decoded.id })
    return res.status(200).json({ refreshToken: newRefreshToken, token: newToken })
  } catch (error) {
    console.error(`[REFRESH_TOKEN] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return res.status(401).json({ error: { code: "REFRESH_TOKEN_INVALID", message: "O refresh token é inválido ou expirou." } })
    }
    return res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado." } })
  }
}

module.exports = refreshToken

const { verify } = require("jsonwebtoken")

const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ error: "No refresh token provided." })

    const parts = refreshToken.split(" ")
    if (parts.length !== 2) return res.status(401).json({ error: "Refresh Token error." })

    const [scheme, refToken] = parts
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: "Refresh Token malformatted." })

    verify(refToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Refresh token invalid." })
      const newRefreshToken = generateRefreshToken({ id: decoded.id })
      const newToken = generateToken({ id: decoded.id })
      return res.status(200).json({ refreshToken: newRefreshToken, token: newToken })
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

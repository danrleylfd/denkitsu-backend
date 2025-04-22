const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")
const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { token, email, password } = req.body
    if (!token?.trim()) throw new Error("TOKEN_MISSING")
    if (!email?.trim()) throw new Error("EMAIL_MISSING")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) throw new Error("EMAIL_INVALID")
    if (!password?.trim() || password.trim().length < 8) throw new Error("PASSWORD_MISSING")
    const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpires")
    if (!user) throw new Error("USER_NOT_FOUND")
    if (user.passwordResetToken.toString() !== token) throw new Error("TOKEN_INVALID")
    const now = new Date()
    if (now > user.passwordResetExpires) throw new Error("TOKEN_INVALID")
    user.password = password
    user.passwordResetExpires = now
    await user.save()
    user.password = undefined
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    return res.status(206).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user
    })
  } catch (error) {
    console.error(`[RESET_PASSWORD] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[RESET_PASSWORD] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      TOKEN_MISSING: { status: 401, message: "No token provided" },
      EMAIL_MISSING: { status: 422, message: "email is required" },
      EMAIL_INVALID: { status: 422, message: "email is invalid" },
      PASSWORD_MISSING: { status: 422, message: "password missing or must be at least 8 characters" },
      USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
      TOKEN_INVALID: { status: 401, message: "invalid or expired token" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

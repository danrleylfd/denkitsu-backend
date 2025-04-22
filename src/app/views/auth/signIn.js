const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email?.trim()) throw new Error("EMAIL_MISSING")
    if (!password?.trim() || password.length < 8) throw new Error("PASSWORD_INVALID")
    const user = await User.findOne({ email: email.trim() }).select("+password")
    if (!user) throw new Error("USER_NOT_FOUND")
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) throw new Error("INVALID_PASSWORD")
    user.password = undefined
    return res.status(200).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user,
      message: "Success to Sign In."
    })
  } catch (error) {
    console.error(`[SIGNIN] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Internal server error" }
    const errorMessages = {
      EMAIL_MISSING: { status: 422, message: "Email is required" },
      PASSWORD_INVALID: { status: 422, message: "Password must be at least 8 characters" },
      USER_NOT_FOUND: { status: 404, message: "User not found" },
      INVALID_PASSWORD: { status: 401, message: "Invalid credentials" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

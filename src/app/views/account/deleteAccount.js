const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const Video = require("../../models/video")
const Comment = require("../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { email, password } = req.body
    if (!email?.trim()) throw new Error("EMAIL_MISSING")
    if (!password?.trim() || password.trim().length < 8) throw new Error("PASSWORD_INVALID")
    const user = await User.findOne({ email: email.trim() }).select("+password")
    if (!user) throw new Error("USER_NOT_FOUND")
    if (user._id.toString() !== userID) throw new Error("UNAUTHORIZED_USER")
    const isValidPassword = await compare(password.trim(), user.password)
    if (!isValidPassword) throw new Error("INVALID_PASSWORD")
    await Promise.all([
      User.deleteOne({ _id: user._id }),
      Video.deleteMany({ user: user._id }),
      Comment.deleteMany({ user: user._id })
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DELETE_ACCOUNT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DELETE_ACCOUNT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      EMAIL_MISSING: { status: 422, message: "Email is required" },
      PASSWORD_INVALID: { status: 422, message: "Password must be at least 8 characters" },
      USER_NOT_FOUND: { status: 404, message: "User not found" },
      UNAUTHORIZED_USER: { status: 401, message: "Unauthorized access" },
      INVALID_PASSWORD: { status: 401, message: "Invalid password" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

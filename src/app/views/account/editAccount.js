// const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { name, avatarUrl, email, password } = req.body
    if (!name?.trim() && !avatarUrl?.trim()) throw new Error("NAME_OR_AVATAR_MISSING")
    // if (!email?.trim()) throw new Error("EMAIL_MISSING")
    // if (!password?.trim() || password.trim().length < 8) throw new Error("PASSWORD_MISSING")
    // const user = await User.findOne({ email: email.trim() }).select("+password")
    const user = await User.findById(userID)
    if (!user) throw new Error("USER_NOT_FOUND")
    if (user._id.toString() !== userID) throw new Error("UNAUTHORIZED_USER")
    // const isValidPassword = await compare(password.trim(), user.password)
    // if (!isValidPassword) throw new Error("INVALID_PASSWORD")
    user.name = name?.trim() || user.name
    user.avatarUrl = avatarUrl?.trim() || user.avatarUrl
    await user.save()
    user = await User.findById(user._id)
    return res.status(206).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user,
      message: "Account successfully edited."
    })
  } catch (error) {
    console.error(`[EDIT_ACCOUNT] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Internal Server Error" }
    const errorMessages = {
      // EMAIL_MISSING: { status: 422, message: "Email is missing." },
      // PASSWORD_MISSING: { status: 422, message: "Password must be at least 8 characters long." },
      // INVALID_PASSWORD: { status: 401, message: "Invalid password." },
      USER_NOT_FOUND: { status: 404, message: "User not found/exists." },
      UNAUTHORIZED_USER: { status: 401, message: "Unauthorized user." },
      NAME_OR_AVATAR_MISSING: { status: 422, message: "name or avatarUrl is missing" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

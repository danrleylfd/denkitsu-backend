const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

const signUp = async (req, res) => {
  try {
    const { name, email, password, avatarUrl: _avatarUrl } = req.body
    if (!name?.trim()) throw new Error("NAME_MISSING")
    if (!email?.trim()) throw new Error("EMAIL_MISSING")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) throw new Error("EMAIL_INVALID")
    if (!password?.trim() || password.length < 8) throw new Error("PASSWORD_INVALID")
    const avatarUrl = _avatarUrl?.trim() || `https://ui-avatars.com/api/?name=${name.split(" ").join("+")}&background=random&size=512&rounded=true&format=png`
    const userExists = await User.findOne({ email: email.trim() })
    if (userExists) throw new Error("USER_EXISTS")
    const user = await User.create({
      name: name.trim(),
      avatarUrl: avatarUrl,
      email: email.trim(),
      password: password.trim()
    })
    user.password = undefined
    return res.status(201).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user
    })
  } catch (error) {
    console.error(`[SIGNUP] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[SIGNUP] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      NAME_MISSING: { status: 422, message: "name is required" },
      EMAIL_MISSING: { status: 422, message: "email is required" },
      EMAIL_INVALID: { status: 422, message: "email is invalid" },
      PASSWORD_INVALID: { status: 422, message: "password must be at least 8 characters" },
      USER_EXISTS: { status: 409, message: "user already exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = signUp

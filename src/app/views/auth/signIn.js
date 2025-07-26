const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body
    // if (!email?.trim()) throw new Error("EMAIL_MISSING")
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // if (!emailRegex.test(email)) throw new Error("EMAIL_INVALID")
    // if (!password?.trim() || password.length < 8) throw new Error("PASSWORD_INVALID")
    const user = await User.findOne({ email: email.trim() }).select("+password")
    if (!user) throw new Error("USER_NOT_FOUND")
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) throw new Error("INVALID_PASSWORD")
    user.password = undefined
    return res.status(200).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user
    })
  } catch (error) {
    console.error(`[SIGNIN] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao tentar fazer login." }
    const errorMessages = {
      USER_NOT_FOUND: { status: 401, message: "E-mail ou senha inválidos." },
      INVALID_PASSWORD: { status: 401, message: "E-mail ou senha inválidos." }
    }
    // const defaultError = { status: 500, message: `[SIGNIN] ${new Date().toISOString()} - Internal server error` }
    // const errorMessages = {
    //   EMAIL_MISSING: { status: 422, message: "email is required" },
    //   EMAIL_INVALID: { status: 422, message: "email is invalid" },
    //   PASSWORD_INVALID: { status: 422, message: "password must be at least 8 characters" },
    //   USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
    //   INVALID_PASSWORD: { status: 401, message: "invalid credentials" }
    // }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = signIn

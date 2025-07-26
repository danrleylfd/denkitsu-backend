const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body
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
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = signIn

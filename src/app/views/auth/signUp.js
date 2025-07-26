const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")

const signUp = async (req, res) => {
  try {
    const { name, email, password, avatarUrl: _avatarUrl } = req.body
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
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado durante o cadastro." }
    const errorMessages = {
      USER_EXISTS: { status: 409, message: "Este e-mail já está em uso." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = signUp

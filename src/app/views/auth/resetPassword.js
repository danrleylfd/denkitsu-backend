const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")
const User = require("../../models/auth")

const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body
    const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpires")
    if (!user) throw new Error("USER_NOT_FOUND")
    if (user.passwordResetToken.toString() !== token) throw new Error("TOKEN_INVALID")
    const now = new Date()
    if (now > user.passwordResetExpires) throw new Error("TOKEN_EXPIRED")
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
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao redefinir a senha." }
    const errorMessages = {
      USER_NOT_FOUND: { status: 404, message: "Usuário não encontrado." },
      TOKEN_INVALID: { status: 401, message: "Token inválido. Por favor, verifique os dados informados." },
      TOKEN_EXPIRED: { status: 401, message: "Token expirado. Por favor, solicite uma nova redefinição de senha." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = resetPassword

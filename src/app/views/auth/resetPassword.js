const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")
const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body
  const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpires")
  if (!user) throw createAppError("Usuário não encontrado.", 404, "USER_NOT_FOUND")
  if (user.passwordResetToken !== token) throw createAppError("Token inválido. Por favor, verifique os dados informados.", 401, "TOKEN_INVALID")
  const now = new Date()
  if (now > user.passwordResetExpires) throw createAppError("Token expirado. Por favor, solicite uma nova redefinição de senha.", 401, "TOKEN_EXPIRED")
  user.password = password
  user.passwordResetExpires = now
  await user.save()
  user.password = undefined
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  return res.status(206).json({
    refreshToken: generateRefreshToken({ id: user._id }),
    token: generateToken({ id: user._id }),
    user: {
      _id: user._id,
      githubId: user.githubId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  })
}

module.exports = resetPassword

const { compare } = require("bcryptjs")
const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")

const createAppError = require("../../../utils/errors")

const signIn = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.trim() }).select("+password")
  if (!user) throw createAppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS")
  const isValidPassword = await compare(password, user.password)
  if (!isValidPassword) throw createAppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS")
  user.password = undefined
  return res.status(200).json({
    refreshToken: generateRefreshToken({ id: user._id }),
    token: generateToken({ id: user._id }),
    user: {
      _id: user._id,
      githubId: user.githubId,
      githubUsername: user.githubUsername,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  })
}

module.exports = signIn

const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const getUser = async (req, res) => {
  const userID = req.params.userID || req.userID
  const user = await User.findById(userID)
  if (!user) throw createAppError("Usuário não encontrado.", 404, "USER_NOT_FOUND")
  if (req.userID !== user._id) {
    return res.status(200).json({ user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }})
  }
  return res.status(200).json({ user })
}

module.exports = getUser

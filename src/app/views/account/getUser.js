const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const getUser = async (req, res) => {
  const userID = req.params.userID || req.userID
  const user = await User.findById(userID)
  if (!user) throw createAppError("Usuário não encontrado.", 404, "USER_NOT_FOUND")
  return res.status(200).json({ user })
}

module.exports = getUser

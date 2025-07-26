const User = require("../../models/auth")

const editAccount = async (req, res) => {
  try {
    const { userID } = req
    const { name, avatarUrl } = req.body
    const user = await User.findById(userID)
    user.name = name?.trim() || user.name
    user.avatarUrl = avatarUrl?.trim() || user.avatarUrl
    await user.save()
    return res.status(200).json({ user })
  } catch (error) {
    console.error(`[EDIT_ACCOUNT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao atualizar a conta." } })
  }
}

module.exports = editAccount

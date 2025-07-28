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
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = editAccount

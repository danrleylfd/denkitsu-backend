const User = require("../../models/auth")

const unlinkGithub = async (req, res) => {
  try {
    const { userID } = req
    const user = await User.findById(userID)
    if (!user) throw new Error("USER_NOT_FOUND")
    user.githubId = undefined
    await user.save()
    const updatedUser = user.toObject()
    delete updatedUser.password
    return res.status(200).json({ user: updatedUser })
  } catch (error) {
    console.error(`[UNLINK_GITHUB] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      USER_NOT_FOUND: { status: 404, message: "Usuário não encontrado." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = unlinkGithub

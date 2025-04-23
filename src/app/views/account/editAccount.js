const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { name, avatarUrl } = req.body
    if (!name?.trim() && !avatarUrl?.trim()) throw new Error("NAME_OR_AVATAR_MISSING")
    const user = await User.findById(userID)
    user.name = name?.trim() || user.name
    user.avatarUrl = avatarUrl?.trim() || user.avatarUrl
    await user.save()
    return res.status(200).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user
    })
  } catch (error) {
    console.error(`[EDIT_ACCOUNT] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[EDIT_ACCOUNT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      NAME_OR_AVATAR_MISSING: { status: 422, message: "name or avatarUrl is required" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { name, avatarUrl } = req.body
    if (name?.length > 16) throw new Error("NAME_TOO_LONG")
    if (avatarUrl?.trim()) {
      try {
        const url = new URL(avatarUrl)
        const isValidImageUrl = /\.(jpg|jpeg|png|webp)$/i.test(url.pathname)
        if (!isValidImageUrl) throw new Error("INVALID_IMAGE_URL")
        if (avatarUrl.length > 255) throw new Error("AVATAR_URL_TOO_LONG")
      } catch {
        throw new Error("INVALID_URL")
      }
    }
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
      NAME_TOO_LONG: { status: 422, message: "name must be less than 16 characters" },
      INVALID_URL: { status: 422, message: "avatarUrl must be a valid url" },
      INVALID_IMAGE_URL: { status: 422, message: "avatarUrl must be a valid image url" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

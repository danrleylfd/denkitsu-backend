const User = require("../../models/auth")

const getUser = async (req, res) => {
  try {
    const userID = req.params.userID || req.userID
    const user = await User.findById(userID)
    if (!user) throw new Error("USER_NOT_FOUND")
    return res.status(200).json({ user })
  } catch (error) {
    console.error(`[GET_USER] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[GET_USER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = getUser

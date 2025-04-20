const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { userID } = req.params || req
    if (!userID || userID.length === 0) return res.status(422).json({ error: "userID missing." })
    const user = await User.findById(userID)
    if (!user) return res.status(404).json({ error: "User not found/exist." })
    return res.status(200).json({ user, message: "Success to get user." })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

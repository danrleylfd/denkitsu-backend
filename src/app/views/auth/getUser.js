const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { id } = req.params || req.query
    if (!id || id.length === 0) return res.status(422).json({ error: "userID missing" })
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: "User not found/exist" })
    return res.status(200).json({ user, message: "Success to get user" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

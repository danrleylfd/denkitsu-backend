const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { id } = req.params || req.query
    if (!id || id.length === 0) return res.status(422).json({ error: "userID missing." })
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: "User not found/exist." })
    return res.status(200).json({ user, message: "Success to get user." })
  } catch ({ error }) {
    return res.status(400).json({ error })
  }
}

const { compare } = require("bcryptjs")

const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { id: userId } = req.query
    const { email, password } = req.body
    if (!email || email.length === 0) return res.status(422).json({ error: "email missing" })
    if (!password || password.length < 8)
      return res.status(422).json({ error: "password missing or too short" })
    const user = await User.findOne({ email }).select("+password")
    if (!user) return res.status(404).json({ error: "User not found/exist" })
    if (user._id !== userId) return res.status(401).json({ error: "Invalid user" })
    const _password = await compare(password, user.password)
    if (!_password) return res.status(401).json({ error: "Invalid password" })
    await User.deleteOne({ _id: user._id })
    return res.status(204).send()
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

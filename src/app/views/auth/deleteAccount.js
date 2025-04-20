const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const Video = require("../../models/video")
const Comment = require("../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { email, password } = req.body
    if (!email || email.length === 0) return res.status(422).json({ error: "email missing." })
    if (!password || password.length < 8) return res.status(422).json({ error: "password missing or too short." })
    const user = await User.findOne({ email }).select("+password")
    if (!user) return res.status(404).json({ error: "user not found." })
    if (user._id !== userID) return res.status(401).json({ error: "invalid user." })
    const _password = await compare(password, user.password)
    if (!_password) return res.status(401).json({ error: "invalid password." })
    await User.deleteOne({ _id: user._id })
    await Video.deleteMany({ user: user._id })
    await Comment.deleteMany({ user: user._id })
    return res.status(204).send()
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

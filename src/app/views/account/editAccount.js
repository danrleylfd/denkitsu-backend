const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { name, email, password, avatarUrl: _avatarUrl } = req.body
    if (!name || name.trim().length === 0) return res.status(422).json({ error: "name missing." })
    if (!email || email.trim().length === 0) return res.status(422).json({ error: "email missing." })
    if (!password || password.trim().length < 8) return res.status(422).json({ error: "password missing or too short." })
    let user = await User.findOne({ email: email.trim() }).select("+password")
    if (!user) return res.status(404).json({ error: "User not found/exist." })
    if (user._id != userID) return res.status(401).json({ error: "Invalid user." })
    let avatarUrl
    if (!_avatarUrl || _avatarUrl.trim().length === 0) avatarUrl = user.avatarUrl
    const _password = await compare(password, user.password)
    if (!_password) return res.status(401).json({ error: "Invalid password." })
    user.password = password
    user.name = name.trim()
    user.avatarUrl = avatarUrl.trim()
    await user.save()
    user = await User.findById(user._id)
    return res.status(206).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user,
      message: "Account successfully edited."
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const { compare } = require("bcryptjs")

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || email.length === 0) return res.status(422).json({ error: "email missing." })
    if (!password || password.length < 8) return res.status(422).json({ error: "password missing or too short." })
    const user = await User.findOne({ email }).select("+password")
    if (!user) return res.status(404).json({ error: "User not found/exist." })
    const _password = await compare(password, user.password)
    if (!_password) return res.status(401).json({ error: "Invalid password." })
    user.password = undefined
    return res.status(200).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user,
      message: "Success to Sign In."
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

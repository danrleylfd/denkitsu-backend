const User = require("../../models/auth")

module.exports = async (req, res) => {
  try {
    const { token, email, password } = req.body
    if (!token || token.trim().length === 0) return res.status(422).json({ error: "token missing." })
    if (!email || email.trim().length === 0) return res.status(422).json({ error: "email missing." })
    if (!password || password.trim().length < 8) return res.status(422).json({ error: "password missing or too short." })
    const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpires")
    if (!user) return res.status(404).json({ error: "User not found/exist." })
    if (token != user.passwordResetToken) return res.status(401).json({ error: "Invalid token." })
    const now = new Date()
    if (now > user.passwordResetExpires) return res.status(401).json({ error: "Token expired, generate a new one." })
    user.password = password
    user.passwordResetExpires = now
    await user.save()
    return res.status(206).json({ message: "Password changed successfully." })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

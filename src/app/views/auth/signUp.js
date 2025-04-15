const User = require("../../models/auth")
const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

module.exports = async (req, res) => {
  try {
    const { name, email, password, avatarUrl: _avatarUrl } = req.body
    if (!name || name.trim().length === 0) return res.status(422).json({ error: "name missing" })
    if (!email || email.trim().length === 0)
      return res.status(422).json({ error: "email missing" })
    if (!password || password.trim().length < 8)
      return res.status(422).json({ error: "password missing or too short" })
    let avatarUrl
    if (!_avatarUrl || _avatarUrl.trim().length === 0)
      avatarUrl = `https://ui-avatars.com/api/?name=${name
        .split(" ")
        .join("+")}&background=random&size=512&rounded=true&format=png`
    else avatarUrl = _avatarUrl.trim()
    const _user = await User.findOne({ email: email.trim() })
    if (_user) return res.status(401).json({ error: "User already exists" })
    const user = await User.create({
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
      email: email.trim(),
      password: password.trim()
    })
    user.password = undefined
    return res.status(201).json({
      token: generateToken({ id: user._id }),
      refreshToken: generateRefreshToken({ id: user._id }),
      user,
      message: "Success to Sign Up."
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const User = require("../../models/auth")
const { generateRefreshToken, generateToken } = require("../../../utils/api/auth")

const createAppError = require("../../../utils/errors")

const signUp = async (req, res) => {
  const { name, email, password, avatarUrl: _avatarUrl } = req.body
  const avatarUrl = _avatarUrl?.trim() || `https://ui-avatars.com/api/?name=${name.split(" ").join("+")}&background=random&size=512&rounded=true&format=png`
  const userExists = await User.findOne({ email: email.trim() })
  if (userExists) throw createAppError("Este e-mail já está em uso.", 409, "USER_EXISTS")
  try {
    const user = await User.create({
      name: name.trim(),
      avatarUrl: avatarUrl,
      email: email.trim(),
      password: password.trim()
    })
    user.password = undefined
    return res.status(201).json({
      refreshToken: generateRefreshToken({ id: user._id }),
      token: generateToken({ id: user._id }),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })
  } catch (error) {
    if (error.code === 11000) throw createAppError("Este e-mail já está em uso.", 409, "USER_EXISTS")
    throw error
  }
}

module.exports = signUp

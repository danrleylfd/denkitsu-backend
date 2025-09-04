const editAccount = async (req, res) => {
  const { user } = req
  const { name, avatarUrl } = req.body
  user.name = name?.trim() || user.name
  user.avatarUrl = avatarUrl?.trim() || user.avatarUrl
  await user.save()
  return res.status(200).json({ user: {
    _id: user._id,
    name: user.name,
    avatarUrl: user.avatarUrl,
  }})
}

module.exports = editAccount

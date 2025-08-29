const unlinkGithub = async (req, res) => {
  const { user } = req
  user.githubId = undefined
  await user.save()
  const updatedUser = user.toObject()
  delete updatedUser.password
  return res.status(200).json({ user: updatedUser })
}

module.exports = unlinkGithub

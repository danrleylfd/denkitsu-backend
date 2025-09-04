const unlinkGithub = async (req, res) => {
  const { user } = req
  user.githubId = undefined
  user.githubUsername = undefined
  user.githubAccessToken = undefined
  await user.save()
  const updatedUser = user.toObject()
  delete updatedUser.password
  return res.status(200).json({ user: {
    _id: updatedUser._id,
    email: updatedUser.email,
    name: updatedUser.name,
    avatarUrl: updatedUser.avatarUrl,
    plan: updatedUser.plan,
    stripeSubscriptionStatus: user.stripeSubscriptionStatus,
    subscriptionStartDate: user.subscriptionStartDate,
    subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  }})
}

module.exports = unlinkGithub

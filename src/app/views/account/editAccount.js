const editAccount = async (req, res) => {
  const { user } = req
  const { name, avatarUrl } = req.body
  user.name = name?.trim() || user.name
  user.avatarUrl = avatarUrl?.trim() || user.avatarUrl
  await user.save()
  return res.status(200).json({ user: {
    _id: user._id,
    githubId: user.githubId,
    githubUsername: user.githubUsername,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    stripeSubscriptionStatus: user.stripeSubscriptionStatus,
    subscriptionStartDate: user.subscriptionStartDate,
    subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }})
}

module.exports = editAccount

const stripeService = require("../../services/stripe")

const reactivateSubscriptionAdmin = async (req, res) => {
  const { user } = req.body
  await stripeService.reactivate(user)
  return res.status(200).json({ message: `A assinatura ${user.stripeSubscriptionId} foi reativada com sucesso.` })
}

module.exports = reactivateSubscriptionAdmin

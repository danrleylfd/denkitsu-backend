const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const reactivateSubscriptionAdmin = async (req, res) => {
  const { email } = req.body
  if (!email) throw createAppError("O e-mail é obrigatório.", 400, "BAD_REQUEST")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")

  if (!user.stripeSubscriptionId || !user.subscriptionCancelAtPeriodEnd) {
    throw createAppError("Este usuário não possui uma assinatura agendada para cancelamento para reativar.", 400, "NOTHING_TO_REACTIVATE")
  }
  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false })
  await User.updateOne({ _id: user._id }, { $set: { subscriptionCancelAtPeriodEnd: false, stripeSubscriptionStatus: "active" } })
  return res.status(200).json({ message: `A assinatura ${user.stripeSubscriptionId} foi reativada com sucesso.` })
}

module.exports = reactivateSubscriptionAdmin

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const syncUserFromStripe = async (req, res) => {
  const { email } = req.body
  if (!email) throw createAppError("O e-mail do usuário é obrigatório.", 400, "EMAIL_REQUIRED")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")
  if (!user.stripeCustomerId) throw createAppError("Este usuário não possui um ID de cliente no Stripe para sincronizar.", 400, "NOT_A_CUSTOMER")
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "active",
    limit: 1,
  })
  if (subscriptions.data.length === 0) {
    await User.updateOne({ _id: user._id }, { $set: { plan: "free" }, $unset: { stripeSubscriptionId: "", stripeSubscriptionStatus: "" } })
    throw createAppError("Nenhuma assinatura ativa encontrada no Stripe para este cliente.", 404, "NO_ACTIVE_SUBSCRIPTION")
  }

  const sub = subscriptions.data[0]
  await User.updateOne(
    { _id: user._id },
    {
      plan: "pro",
      stripeSubscriptionId: sub.id,
      stripeSubscriptionStatus: sub.status,
    }
  )

  return res.status(200).json({ message: "Sincronização concluída com sucesso.", status: sub.status, plan: "pro" })
}

module.exports = syncUserFromStripe

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const cancelSubscriptionAdmin = async (req, res) => {
  const { email } = req.body
  if (!email) throw createAppError("O e-mail é obrigatório.", 400, "BAD_REQUEST")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")

  if (user.stripeSubscriptionId && user.stripeSubscriptionStatus === "active") {
    await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true })
    const cancellationStatus = `Cancelamento da assinatura ${user.stripeSubscriptionId} agendado para o final do período.`
    return res.status(200).json({ message: "Operação de cancelamento concluída.", results: { cancellationStatus } })
  } else {
    throw createAppError("Nenhuma assinatura ativa para cancelar.", 400, "NO_ACTIVE_SUBSCRIPTION")
  }
}

module.exports = cancelSubscriptionAdmin

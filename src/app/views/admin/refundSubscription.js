const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../../models/auth")
const createAppError = require("../../../utils/errors")

const refundSubscriptionAdmin = async (req, res) => {
  const { email } = req.body
  if (!email) throw createAppError("O e-mail é obrigatório.", 400, "BAD_REQUEST")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")
  if (!user.stripeCustomerId) throw createAppError("Este usuário não é um cliente Stripe.", 400, "NOT_A_CUSTOMER")

  let refundStatus = "Nenhuma ação de reembolso solicitada."
  let cancellationStatus = "Nenhuma ação de cancelamento solicitada."

  if (!user.subscriptionStartDate) {
    refundStatus = "Reembolso não aplicável: Data de início da assinatura não encontrada."
  } else {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const subscriptionAgeInMs = Date.now() - user.subscriptionStartDate.getTime()
    if (subscriptionAgeInMs <= sevenDaysInMs) {
      const charges = await stripe.charges.list({ customer: user.stripeCustomerId, limit: 1 })
      if (charges.data.length > 0 && charges.data[0].paid && !charges.data[0].refunded) {
        await stripe.refunds.create({ charge: charges.data[0].id })
        refundStatus = `Pagamento ${charges.data[0].id} reembolsado com sucesso.`
        if (user.stripeSubscriptionId && user.stripeSubscriptionStatus !== "canceled") {
          try {
            await stripe.subscriptions.cancel(user.stripeSubscriptionId)
            cancellationStatus = `Assinatura ${user.stripeSubscriptionId} cancelada imediatamente devido ao reembolso.`
          } catch (cancelError) {
            console.error("Erro ao cancelar assinatura após reembolso:", cancelError)
            cancellationStatus = `Reembolso processado, mas falha ao cancelar a assinatura imediatamente: ${cancelError.message}`
          }
        }
      } else {
        refundStatus = "Nenhum pagamento recente e não reembolsado foi encontrado."
      }
    } else {
      refundStatus = "Reembolso negado: A política de 7 dias expirou."
    }
  }
  return res.status(200).json({ message: "Operação de reembolso concluída.", results: { refundStatus, cancellationStatus } })
}

module.exports = refundSubscriptionAdmin

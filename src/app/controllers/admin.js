const { Router } = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../models/auth")
const adminMiddleware = require("../middlewares/admin")
const asyncHandler = require("../middlewares/asyncHandler")
const createAppError = require("../../utils/errors")

const routes = Router()

routes.use(adminMiddleware)

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


const refundAndCancel = async (req, res) => {
  const { email } = req.body
  if (!email) throw createAppError("O e-mail do usuário é obrigatório.", 400, "EMAIL_REQUIRED")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")
  if (!user.stripeCustomerId) throw createAppError("Este usuário não é um cliente Stripe.", 400, "NOT_A_CUSTOMER")
  let refundMessage = "Nenhum pagamento encontrado para reembolsar ou o reembolso não é aplicável."
  if (user.subscriptionStartDate) {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const subscriptionAgeInMs = Date.now() - user.subscriptionStartDate.getTime()
    if (subscriptionAgeInMs <= sevenDaysInMs) {
      const charges = await stripe.charges.list({
        customer: user.stripeCustomerId,
        limit: 1,
      })
      if (charges.data.length > 0) {
        const lastCharge = charges.data[0]
        if (lastCharge.paid && !lastCharge.refunded) {
          await stripe.refunds.create({ charge: lastCharge.id })
          refundMessage = `Pagamento ${lastCharge.id} reembolsado com sucesso (dentro da política de 7 dias).`
        }
      }
    } else {
      refundMessage = "O período de 7 dias para reembolso expirou."
    }
  }
  let cancellationMessage = "Nenhuma assinatura ativa para cancelar."
  if (user.stripeSubscriptionId && user.stripeSubscriptionStatus === "active") {
    await stripe.subscriptions.cancel(user.stripeSubscriptionId)
    cancellationMessage = `Assinatura ${user.stripeSubscriptionId} cancelada com sucesso. O acesso Pro continuará até o fim do período pago.`
  }
  return res.status(200).json({
    message: "Operação de gerenciamento concluída.",
    refundStatus: refundMessage,
    cancellationStatus: cancellationMessage
  })
}

routes.post("/manage-subscription", asyncHandler(refundAndCancel))
routes.post("/sync-subscription", asyncHandler(syncUserFromStripe))

const loadAdminRoutes = (app) => app.use("/admin", routes)

module.exports = loadAdminRoutes

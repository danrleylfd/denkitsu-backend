const { Router } = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../models/auth")
const adminMiddleware = require("../middlewares/admin")
const asyncHandler = require("../middlewares/asyncHandler")
const createAppError = require("../../utils/errors")

const routes = Router()
routes.use(adminMiddleware)

const manageSubscription = async (req, res) => {
  const { email, action } = req.body
  if (!email || !action) throw createAppError("O e-mail e a ação são obrigatórios.", 400, "BAD_REQUEST")
  const user = await User.findOne({ email })
  if (!user) throw createAppError(`Usuário com e-mail ${email} não encontrado.`, 404, "USER_NOT_FOUND")
  if (!user.stripeCustomerId) throw createAppError("Este usuário não é um cliente Stripe.", 400, "NOT_A_CUSTOMER")
  let refundStatus = "Nenhuma ação de reembolso solicitada."
  let cancellationStatus = "Nenhuma ação de cancelamento solicitada."
  if (action === "refund") {
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
        } else {
          refundStatus = "Nenhum pagamento recente e não reembolsado foi encontrado."
        }
      } else {
        refundStatus = "Reembolso negado: A política de 7 dias expirou."
      }
    }
  }
  if (action === "cancel" || action === "refund") {
    if (user.stripeSubscriptionId && user.stripeSubscriptionStatus === "active") {
      await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true })
      cancellationStatus = `Cancelamento da assinatura ${user.stripeSubscriptionId} agendado para o final do período.`
    } else {
      cancellationStatus = "Nenhuma assinatura ativa para cancelar."
    }
  }
  return res.status(200).json({
    message: "Operação de gerenciamento concluída.",
    results: { refundStatus, cancellationStatus }
  })
}

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

routes.post("/manage-subscription", asyncHandler(manageSubscription))
routes.post("/sync-subscription", asyncHandler(syncUserFromStripe))

const loadAdminRoutes = (app) => app.use("/admin", routes)

module.exports = loadAdminRoutes

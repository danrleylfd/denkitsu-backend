const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { v4: uuidv4 } = require("uuid")
const User = require("../models/auth")
const createAppError = require("../../utils/errors")

const scheduleCancellation = async (user) => {
  if (!user.stripeSubscriptionId || user.stripeSubscriptionStatus !== "active") {
    throw createAppError("Nenhuma assinatura ativa para cancelar.", 400, "NO_ACTIVE_SUBSCRIPTION")
  }
  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true })
  const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { subscriptionCancelAtPeriodEnd: true } }, { new: true })
  return updatedUser
}

const reactivate = async (user) => {
  if (!user.stripeSubscriptionId || !user.subscriptionCancelAtPeriodEnd) {
    throw createAppError("Este usuário não possui uma assinatura agendada para cancelamento para reativar.", 400, "NOTHING_TO_REACTIVATE")
  }
  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false })
  const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { subscriptionCancelAtPeriodEnd: false, stripeSubscriptionStatus: "active" } }, { new: true })
  return updatedUser
}

const processRefund = async (user) => {
  if (!user.stripeCustomerId) throw createAppError("Este usuário não é um cliente Stripe.", 400, "NOT_A_CUSTOMER")
  let refundStatus = "Nenhuma ação de reembolso solicitada."
  let cancellationStatus = "Nenhuma ação de cancelamento solicitada."
  if (!user.subscriptionStartDate) {
    refundStatus = "Reembolso não aplicável: Data de início da assinatura não encontrada."
  } else {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const subscriptionAgeInMs = Date.now() - new Date(user.subscriptionStartDate).getTime()
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
  return { refundStatus, cancellationStatus }
}

const syncFromStripe = async (user) => {
  if (!user.stripeCustomerId) throw createAppError("Este usuário não possui um ID de cliente no Stripe para sincronizar.", 400, "NOT_A_CUSTOMER")
  const subscriptions = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: "active", limit: 1 })
  if (subscriptions.data.length === 0) {
    await User.updateOne({ _id: user._id }, { $set: { plan: "free" }, $unset: { stripeSubscriptionId: "", stripeSubscriptionStatus: "" } })
    throw createAppError("Nenhuma assinatura ativa encontrada no Stripe para este cliente.", 404, "NO_ACTIVE_SUBSCRIPTION")
  }
  const sub = subscriptions.data[0]
  await User.updateOne({ _id: user._id }, { plan: "pro", stripeSubscriptionId: sub.id, stripeSubscriptionStatus: sub.status })
  return { status: sub.status, plan: "pro" }
}

const createCheckout = async (user) => {
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user._id.toString() } })
    customerId = customer.id
    await User.updateOne({ _id: user._id }, { stripeCustomerId: customerId })
  }
  const idempotencyKey = uuidv4()
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.HOST1}/subscription?payment_success=true`,
    cancel_url: `${process.env.HOST1}/subscription?payment_canceled=true`,
    metadata: { userId: user._id.toString() }
  }, { idempotencyKey })
  return { url: session.url }
}

module.exports = {
  scheduleCancellation,
  reactivate,
  processRefund,
  syncFromStripe,
  createCheckout,
}

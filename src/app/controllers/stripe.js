const { Router } = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { v4: uuidv4 } = require("uuid")
const User = require("../models/auth")
const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")

const routes = Router()

const createCustomerPortal = async (req, res) => {
  const { user } = req
  console.log(user)
  if (!user.stripeCustomerId) return res.status(400).json({ error: "Usuário não possui assinatura." })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.HOST1}/subscription`,
  })
  return res.json({ url: portalSession.url })
}

const createCheckoutSession = async (req, res) => {
  const { userID, user } = req
  if (user.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    if (subscription.status === "active" && subscription.cancel_at_period_end) {
      console.log(`Usuário ${userID} está reativando a assinatura ${subscription.id}.`)
      await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false })
      await User.updateOne({ _id: userID }, { $set: { stripeSubscriptionStatus: "active" } })
      console.log("Assinatura reativada com sucesso. Redirecionando para o portal do cliente.")
      return createCustomerPortal(req, res)
    }
  }
  if (user.plan === "pro" && user.stripeSubscriptionStatus === "active") {
    console.log("Usuário já é Pro. Redirecionando para o portal do cliente.")
    return createCustomerPortal(req, res)
  }
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: userID.toString() }
    })
    customerId = customer.id
    await User.updateOne({ _id: userID }, { stripeCustomerId: customerId })
  }
  const idempotencyKey = uuidv4()
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.HOST1}/subscription?payment_success=true`,
    cancel_url: `${process.env.HOST1}/subscription?payment_canceled=true`,
    metadata: { userId: userID.toString() }
  }, { idempotencyKey })
  return res.json({ url: session.url })
}

routes.post("/create-customer-portal", authMiddleware, asyncHandler(createCustomerPortal))
routes.post("/create-checkout-session", authMiddleware, asyncHandler(createCheckoutSession))

const loadStripeRoutes = (app) => app.use("/stripe", routes)

module.exports = loadStripeRoutes

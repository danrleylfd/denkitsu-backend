const { Router } = require("express")
const express = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { v4: uuidv4 } = require("uuid")
const User = require("../models/auth")
const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")

const routes = Router()

const createCheckoutSession = async (req, res) => {
  const { userID } = req
  const user = await User.findById(userID)

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

const createCustomerPortal = async (req, res) => {
  const { userID } = req
  const user = await User.findById(userID)

  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "Usuário não possui assinatura." })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.HOST1}/subscription`,
  })

  return res.json({ url: portalSession.url })
}

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.log(`❌ Erro na verificação do webhook: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  const session = event.data.object
  const userId = session.metadata?.userId || null
  const subscriptionId = session.subscription || session.id
  console.log(`🔔 Webhook recebido: ${event.type} para Subscrição ${subscriptionId}`)
  switch (event.type) {
    case "checkout.session.completed": {
      if (!userId) {
        console.error("Webhook de checkout sem userId nos metadados.")
        break
      }
      const user = await User.findById(userId)
      if (user && user.stripeSubscriptionId) {
        console.log(`Webhook ${event.id} já processado para o usuário ${userId}. Ignorando.`)
        break
      }
      await User.updateOne(
        { _id: userId },
        {
          stripeSubscriptionId: subscriptionId,
          stripeSubscriptionStatus: "active",
          plan: "pro"
        }
      )
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await User.updateOne(
        { stripeSubscriptionId: subscriptionId },
        {
          stripeSubscriptionStatus: subscription.status,
          plan: subscription.status === "active" ? "pro" : "free"
        }
      )
      break
    }
  }
  res.status(200).json({ received: true })
}

routes.post("/create-checkout-session", authMiddleware, asyncHandler(createCheckoutSession))
routes.post("/create-customer-portal", authMiddleware, asyncHandler(createCustomerPortal))
routes.post("/webhook", express.raw({ type: "application/json" }), asyncHandler(stripeWebhook))

const loadStripeRoutes = (app) => {
  app.use("/stripe", routes)
}

module.exports = loadStripeRoutes

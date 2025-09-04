const { Router } = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const stripeService = require("../services/stripe")

const routes = Router()

const createCustomerPortal = async (req, res) => {
  const { user } = req
  if (!user.stripeCustomerId) return res.status(400).json({ error: "Usuário não possui assinatura." })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.HOST1}/subscription`
  })
  return res.json({ url: portalSession.url })
}

const createCheckoutSession = async (req, res) => {
  const { user } = req
  if (user.subscriptionCancelAtPeriodEnd) {
    const updatedUser = await stripeService.reactivate(user)
    return res.status(200).json({ type: "reactivation", user: updatedUser })
  }
  if (user.plan === "pro" && user.stripeSubscriptionStatus === "active") {
    return createCustomerPortal(req, res)
  }
  const { url } = await stripeService.createCheckout(user)
  return res.json({ type: "checkout", url })
}

const cancelSubscription = async (req, res) => {
  const updatedUser = await stripeService.scheduleCancellation(req.user)
  return res.status(200).json({ message: "Cancelamento de assinatura agendado com sucesso.", user: updatedUser })
}

routes.post("/create-customer-portal", authMiddleware, asyncHandler(createCustomerPortal))
routes.post("/create-checkout-session", authMiddleware, asyncHandler(createCheckoutSession))
routes.post("/cancel-subscription", authMiddleware, asyncHandler(cancelSubscription))

const loadStripeRoutes = (app) => app.use("/stripe", routes)

module.exports = loadStripeRoutes

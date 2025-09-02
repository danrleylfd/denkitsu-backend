const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../../models/auth")

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

module.exports = stripeWebhook

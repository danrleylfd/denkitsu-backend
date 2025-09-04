const User = require("../../models/auth")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const handleCheckoutSessionCompleted = async (session) => {
  const userID = session.metadata?.userId
  const subscriptionId = session.subscription
  if (!userID) {
    console.error("[STRIPE_HANDLER] Webhook de 'checkout.session.completed' sem userID nos metadados.")
    return
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await User.updateOne(
    { _id: userID },
    {
      $set: {
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        plan:  "plus",
        subscriptionStartDate: new Date(subscription.created * 1000),
        subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    }
  )
  console.log(`[STRIPE_HANDLER] Usuário ${userID} atualizado para o plano 'pro' com a nova assinatura ${subscription.id}`)
}

module.exports = handleCheckoutSessionCompleted

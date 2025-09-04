const User = require("../../models/auth")

const handleSubscriptionUpdated = async (subscription) => {
  const newPlan = (subscription.status === "active" || subscription.status === "trialing") ?  "plus" : "free"
  await User.updateOne(
    { stripeSubscriptionId: subscription.id },
    {
      $set: {
        stripeSubscriptionStatus: subscription.status,
        plan: newPlan,
        subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    }
  )
  console.log(`[STRIPE_HANDLER] Assinatura ${subscription.id} atualizada. Novo status: ${subscription.status}, Novo plano: ${newPlan}.`)
}

module.exports = handleSubscriptionUpdated

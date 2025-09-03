const User = require("../../models/auth")

const handleSubscriptionDeleted = async (subscription) => {
  await User.updateOne(
    { stripeSubscriptionId: subscription.id },
    {
      $set: { plan: "free" },
      $unset: {
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionCancelAtPeriodEnd: true,
      }
    }
  )
  console.log(`[STRIPE_HANDLER] Assinatura ${subscription.id} deletada. Usuário atualizado para o plano 'free'.`)
}

module.exports = handleSubscriptionDeleted

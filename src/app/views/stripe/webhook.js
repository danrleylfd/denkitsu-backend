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
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
            plan: "pro",
            subscriptionStartDate: new Date(subscription.created * 1000),
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        }
      )
      console.log(`[STRIPE_WEBHOOK] Usuário ${userId} atualizado para o plano 'pro' com a nova assinatura ${subscription.id}`)
      break
    }
    case "customer.subscription.updated": {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      // O plano só deixa de ser 'pro' se o status não for mais 'active' ou 'trialing'.
      // Isso garante o acesso durante o período de carência após o cancelamento.
      const newPlan = (subscription.status === "active" || subscription.status === "trialing") ? "pro" : "free"
      await User.updateOne(
        { stripeSubscriptionId: subscriptionId },
        {
          $set: {
            stripeSubscriptionStatus: subscription.status,
            plan: newPlan,
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        }
      )
      break
    }
    case "customer.subscription.deleted": {
      // Quando a assinatura é efetivamente deletada (no fim do ciclo), o plano vira 'free'.
      await User.updateOne(
        { stripeSubscriptionId: subscriptionId },
        {
          $set: {
            stripeSubscriptionStatus: "deleted",
            plan: "free",
            subscriptionCancelAtPeriodEnd: false,
          }
        }
      )
      break
    }
  }
  res.status(200).json({ received: true })
}

module.exports = stripeWebhook

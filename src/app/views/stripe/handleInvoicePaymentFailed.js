const User = require("../../models/auth")

const handleInvoicePaymentFailed = async (invoice) => {
  const customerId = invoice.customer
  await User.updateOne(
    { stripeCustomerId: customerId },
    { $set: { stripeSubscriptionStatus: "past_due" } }
  )
  console.log(`[STRIPE_HANDLER] Falha no pagamento para o cliente ${customerId}. Status atualizado para 'past_due'.`)
  // Futuramente, aqui podemos disparar um e-mail para o cliente.
}

module.exports = handleInvoicePaymentFailed

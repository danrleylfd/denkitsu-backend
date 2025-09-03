const handleCheckoutSessionCompleted = require("./handleCheckoutSessionCompleted")
const handleInvoicePaymentFailed = require("./handleInvoicePaymentFailed")
const handleSubscriptionDeleted = require("./handleSubscriptionDeleted")
const handleSubscriptionUpdated = require("./handleSubscriptionUpdated")

const eventHandlers = {
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
}

module.exports = eventHandlers

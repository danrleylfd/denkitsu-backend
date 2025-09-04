const stripeService = require("../../services/stripe")

const refundSubscriptionAdmin = async (req, res) => {
  const { user } = req.body
  const { refundStatus, cancellationStatus } = await stripeService.processRefund(user)
  return res.status(200).json({ message: "Operação de reembolso concluída.", results: { refundStatus, cancellationStatus } })
}

module.exports = refundSubscriptionAdmin

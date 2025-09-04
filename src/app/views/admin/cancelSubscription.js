const stripeService = require("../../services/stripe")

const cancelSubscriptionAdmin = async (req, res) => {
  const { user } = req.body
  await stripeService.scheduleCancellation(user)
  const cancellationStatus = `Cancelamento da assinatura ${user.stripeSubscriptionId} agendado para o final do período.`
  return res.status(200).json({ message: "Operação de cancelamento concluída.", results: { cancellationStatus } })
}

module.exports = cancelSubscriptionAdmin

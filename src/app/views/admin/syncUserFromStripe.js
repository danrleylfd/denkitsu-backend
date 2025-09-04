const stripeService = require("../../services/stripe")

const syncUserFromStripe = async (req, res) => {
  const { user } = req.body
  const result = await stripeService.syncFromStripe(user)
  return res.status(200).json({ message: "Sincronização concluída com sucesso.", ...result })
}

module.exports = syncUserFromStripe

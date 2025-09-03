const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const eventHandlers = require("./eventHandlers")

const processedEvents = new Set()

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.log(`❌ Erro na verificação do webhook: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  if (processedEvents.has(event.id)) {
    console.log(`[STRIPE_WEBHOOK] Evento ${event.id} já processado. Ignorando.`)
    return res.status(200).json({ received: true, message: "Event already processed." })
  }
  processedEvents.add(event.id)
  setTimeout(() => processedEvents.delete(event.id), 24 * 60 * 60 * 1000)
  const handler = eventHandlers[event.type]
  if (handler) {
    console.log(`[STRIPE_WEBHOOK] Evento recebido: ${event.type}. Acionando handler...`)
    try {
      await handler(event.data.object)
    } catch (error) {
      console.error(`[STRIPE_HANDLER_ERROR] Erro ao processar o evento ${event.type}:`, error)
      return res.status(500).json({ error: "Erro interno no handler do webhook." })
    }
  } else console.warn(`[STRIPE_WEBHOOK] Nenhum handler encontrado para o evento: ${event.type}`)
  res.status(200).json({ received: true })
}

module.exports = stripeWebhook

const Agent = require("../../models/agent")
const Acquisition = require("../../models/acquisition")

const createAppError = require("../../../utils/errors")

const acquireOne = async (req, res) => {
  const { userID, user } = req
  const { agentId } = req.params
  if (user.plan === "pro") {
    const acquisitionCount = await Acquisition.countDocuments({ user: userID, itemType: "Agent" })
    if (acquisitionCount >= 3) throw createAppError("Você atingiu o limite de 3 agentes adquiridos da loja para o Plano Free. Faça upgrade para adquirir agentes ilimitados.", 409, "AGENT_LIMIT_REACHED")
  }
  const agent = await Agent.findById(agentId)
  if (!agent || !agent.published) throw createAppError("Agente não encontrado ou não está disponível na loja.", 404, "AGENT_NOT_FOUND_OR_NOT_PUBLISHED")
  if (agent.author.toString() === userID.toString()) throw createAppError("Você não pode adquirir um agente que você mesmo criou.", 403, "CANNOT_ACQUIRE_OWN_AGENT")
  await Acquisition.findOneAndUpdate(
    { user: userID, item: agentId },
    { user: userID, item: agentId, itemType: "Agent" },
    { upsert: true }
  )
  return res.status(200).json({ message: "Agente adquirido com sucesso." })
}

module.exports = acquireOne

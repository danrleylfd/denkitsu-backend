const Agent = require("../../models/agent")
const Acquisition = require("../../models/acquisition")

const acquireOne = async (req, res) => {
  try {
    const { userID } = req
    const { agentId } = req.params

    const agent = await Agent.findById(agentId)
    if (!agent || !agent.published) throw new Error("AGENT_NOT_FOUND_OR_NOT_PUBLISHED")
    if (agent.author.toString() === userID.toString()) throw new Error("CANNOT_ACQUIRE_OWN_AGENT")

    await Acquisition.findOneAndUpdate(
      { user: userID, item: agentId },
      { user: userID, item: agentId, itemType: "Agent" },
      { upsert: true }
    )

    return res.status(200).json({ message: "Agente adquirido com sucesso." })
  } catch (error) {
    console.error(`[ACQUIRE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AGENT_NOT_FOUND_OR_NOT_PUBLISHED: { status: 404, message: "Agente não encontrado ou não está disponível na loja." },
      CANNOT_ACQUIRE_OWN_AGENT: { status: 403, message: "Você não pode adquirir um agente que você mesmo criou." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = acquireOne

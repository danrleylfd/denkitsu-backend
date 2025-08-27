const Agent = require("../../models/agent")

const unacquireOne = async (req, res) => {
  try {
    const { userID } = req
    const { agentId } = req.params

    await Agent.updateOne({ _id: agentId }, { $pull: { clients: userID } })

    return res.status(200).json({ message: "Agente removido da sua coleção." })
  } catch (error) {
    console.error(`[UNACQUIRE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = unacquireOne

const Agent = require("../../models/agent")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { agentId } = req.params
    const agentData = req.body

    const agent = await Agent.findOneAndUpdate(
      { _id: agentId, user: userID },
      { $set: agentData },
      { new: true }
    )

    if (!agent) {
      throw new Error("AGENT_NOT_FOUND_OR_UNAUTHORIZED")
    }
    return res.status(200).json(agent)
  } catch (error) {
    console.error(`[UPDATE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "AGENT_NAME_EXISTS", message: "Você já possui um agente com este nome." },
      })
    }
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AGENT_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Agente não encontrado ou você não tem permissão para editá-lo." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = updateOne

const Agent = require("../../models/agent")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { agentId } = req.params

    const result = await Agent.deleteOne({ _id: agentId, user: userID })

    if (result.deletedCount === 0) {
      throw new Error("AGENT_NOT_FOUND_OR_UNAUTHORIZED")
    }
    return res.status(204).send()
  } catch (error) {
    console.error(`[DELETE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AGENT_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Agente não encontrado ou você não tem permissão para excluí-lo." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = deleteOne

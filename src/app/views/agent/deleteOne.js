const Agent = require("../../models/agent")

const createAppError = require("../../../utils/errors")

const deleteOne = async (req, res) => {
  const { userID } = req
  const { agentId } = req.params
  const result = await Agent.deleteOne({ _id: agentId, author: userID })
  if (result.deletedCount === 0) throw createAppError("Agente não encontrado ou você não tem permissão para excluí-lo.", 404, "AGENT_NOT_FOUND_OR_UNAUTHORIZED")
  return res.status(204).send()
}

module.exports = deleteOne

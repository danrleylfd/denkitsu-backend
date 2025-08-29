const Agent = require("../../models/agent")

const createAppError = require("../../../utils/errors")

const updateOne = async (req, res) => {
  const { userID } = req
  const { agentId } = req.params
  const agentData = req.body
  try {
    const agent = await Agent.findOneAndUpdate(
      { _id: agentId, author: userID },
      { $set: agentData },
      { new: true, runValidators: true }
    )
    if (!agent) throw createAppError("Agente não encontrado ou você não tem permissão para editá-lo.", 404, "AGENT_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(agent)
  } catch (error) {
    if (error.code === 11000) throw createAppError("Você já possui um agente com este nome.", 409, "AGENT_NAME_EXISTS")
    throw error
  }
}

module.exports = updateOne

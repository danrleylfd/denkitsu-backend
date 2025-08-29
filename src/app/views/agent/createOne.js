const Agent = require("../../models/agent")

const createAppError = require("../../../utils/errors")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const agentData = { ...req.body, author: userID }
    const agent = await Agent.create(agentData)
    return res.status(201).json(agent)
  } catch (error) {
    console.error(`[CREATE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) throw createAppError("Você já possui um agente com este nome.", 409, "AGENT_NAME_EXISTS")
    throw error
  }
}

module.exports = createOne

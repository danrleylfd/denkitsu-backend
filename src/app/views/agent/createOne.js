const Agent = require("../../models/agent")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const agentData = { ...req.body, user: userID }
    const agent = await Agent.create(agentData)
    return res.status(201).json(agent)
  } catch (error) {
    console.error(`[CREATE_AGENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "AGENT_NAME_EXISTS", message: "Você já possui um agente com este nome." },
      })
    }
    const errorMessages = {
      AGENT_LIMIT_REACHED: { status: 403, message: "Limite de 7 agentes customizados atingido." },
    }
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne

const Agent = require("../../models/agent")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const agents = await Agent.find({
      $or: [{ author: userID }, { clients: userID }]
    }).sort("-createdAt")
    return res.status(200).json(agents)
  } catch (error) {
    console.error(`[READ_MANY_AGENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readMany

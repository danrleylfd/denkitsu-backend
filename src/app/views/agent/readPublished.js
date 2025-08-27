const Agent = require("../../models/agent")

const readPublished = async (req, res) => {
  try {
    const agents = await Agent.find({ published: true }).populate("author", "name avatarUrl").sort("-createdAt")
    return res.status(200).json(agents)
  } catch (error) {
    console.error(`[READ_PUBLISHED_AGENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readPublished

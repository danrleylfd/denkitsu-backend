const Tool = require("../../models/tool")

const readPublished = async (req, res) => {
  try {
    const tools = await Tool.find({ published: true }).populate("author", "name avatarUrl").sort("-createdAt")
    return res.status(200).json(tools)
  } catch (error) {
    console.error(`[READ_PUBLISHED_TOOLS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readPublished

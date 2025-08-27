const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")

const acquireOne = async (req, res) => {
  try {
    const { userID } = req
    const { toolId } = req.params

    const tool = await Tool.findById(toolId)
    if (!tool || !tool.published) throw new Error("TOOL_NOT_FOUND_OR_NOT_PUBLISHED")
    if (tool.author.toString() === userID.toString()) throw new Error("CANNOT_ACQUIRE_OWN_TOOL")

    await Acquisition.findOneAndUpdate(
      { user: userID, item: toolId },
      { user: userID, item: toolId, itemType: "Tool" },
      { upsert: true }
    )

    return res.status(200).json({ message: "Ferramenta adquirida com sucesso." })
  } catch (error) {
    console.error(`[ACQUIRE_TOOL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      TOOL_NOT_FOUND_OR_NOT_PUBLISHED: { status: 404, message: "Ferramenta não encontrada ou não está disponível na loja." },
      CANNOT_ACQUIRE_OWN_TOOL: { status: 403, message: "Você não pode adquirir uma ferramenta que você mesmo criou." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = acquireOne

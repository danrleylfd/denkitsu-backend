const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")

const createAppError = require("../../../utils/errors")

const acquireOne = async (req, res) => {
  const { userID: user } = req
  const { toolId } = req.params
  const tool = await Tool.findById(toolId)
  if (!tool || !tool.published) throw createAppError("Ferramenta não encontrada ou não está disponível na loja.", 404, "TOOL_NOT_FOUND_OR_NOT_PUBLISHED")
  if (tool.author.toString() === user._id.toString()) throw createAppError("Você não pode adquirir uma ferramenta que você mesmo criou.", 403, "CANNOT_ACQUIRE_OWN_TOOL")
  await Acquisition.findOneAndUpdate(
    { user: user._id, item: toolId },
    { user: user._id, item: toolId, itemType: "Tool" },
    { upsert: true }
  )
  return res.status(200).json({ message: "Ferramenta adquirida com sucesso." })
}

module.exports = acquireOne

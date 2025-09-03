const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")

const createAppError = require("../../../utils/errors")

const acquireOne = async (req, res) => {
  const { userID, user } = req
  const { toolId } = req.params
  if (user.plan === "pro") {
    const acquisitionCount = await Acquisition.countDocuments({ user: userID, itemType: "Tool" })
    if (acquisitionCount >= 3) throw createAppError("Você atingiu o limite de 3 ferramentas adquiridas da loja para o Plano Free. Faça upgrade para adquirir ferramentas ilimitadas.", 409, "TOOL_LIMIT_REACHED")
  }
  const tool = await Tool.findById(toolId)
  if (!tool || !tool.published) throw createAppError("Ferramenta não encontrada ou não está disponível na loja.", 404, "TOOL_NOT_FOUND_OR_NOT_PUBLISHED")
  if (tool.author.toString() === userID.toString()) throw createAppError("Você não pode adquirir uma ferramenta que você mesmo criou.", 403, "CANNOT_ACQUIRE_OWN_TOOL")
  await Acquisition.findOneAndUpdate(
    { user: userID, item: toolId },
    { user: userID, item: toolId, itemType: "Tool" },
    { upsert: true }
  )
  return res.status(200).json({ message: "Ferramenta adquirida com sucesso." })
}

module.exports = acquireOne

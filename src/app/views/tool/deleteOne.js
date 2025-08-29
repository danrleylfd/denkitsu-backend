const Tool = require("../../models/tool")
const createAppError = require("../../../utils/errors")

const deleteOne = async (req, res) => {
  const { user } = req
  const { toolId } = req.params
  const result = await Tool.deleteOne({ _id: toolId, author: user._id })
  if (result.deletedCount === 0) throw createAppError("Ferramenta não encontrada ou você não tem permissão para excluí-la.", 404, "TOOL_NOT_FOUND_OR_UNAUTHORIZED")
  return res.status(204).send()
}

module.exports = deleteOne

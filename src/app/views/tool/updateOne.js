const Tool = require("../../models/tool")

const createAppError = require("../../../utils/errors")

const updateOne = async (req, res) => {
  const { user } = req
  const { toolId } = req.params
  const toolData = req.body
  try {
    const tool = await Tool.findOneAndUpdate(
      { _id: toolId, author: user._id },
      { $set: toolData },
      { new: true, runValidators: true }
    )
    if (!tool) throw createAppError("Ferramenta não encontrada ou você não tem permissão para editá-la.", 404, "TOOL_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(tool)
  } catch (error) {
    if (error.code === 11000) throw createAppError("Você já possui uma ferramenta com este nome.", 409, "TOOL_NAME_EXISTS")
    throw error
  }
}

module.exports = updateOne

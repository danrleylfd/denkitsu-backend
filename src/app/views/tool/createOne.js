const Tool = require("../../models/tool")

const createAppError = require("../../../utils/errors")

const createOne = async (req, res) => {
  const { user } = req
  const toolData = { ...req.body, author: user._id }
  try {
    const tool = await Tool.create(toolData)
    return res.status(201).json(tool)
  } catch (error) {
    if (error.code === 11000) {
      throw createAppError("Você já possui uma ferramenta com este nome.", 409, "TOOL_NAME_EXISTS")
    }
    throw error
  }
}

module.exports = createOne

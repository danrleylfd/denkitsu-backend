const Tool = require("../../models/tool")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { toolId } = req.params
    const { name, description, title, Icon, parameters, httpConfig } = req.body

    const tool = await Tool.findOneAndUpdate(
      { _id: toolId, user: userID },
      { $set: { name, description, title, Icon, parameters, httpConfig } },
      { new: true }
    )

    if (!tool) throw new Error("TOOL_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(tool)
  } catch (error) {
    console.error(`[UPDATE_TOOL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "TOOL_NAME_EXISTS", message: "Você já possui uma ferramenta com este nome." }
      })
    }
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      TOOL_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Ferramenta não encontrada ou você não tem permissão para editá-la." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = updateOne

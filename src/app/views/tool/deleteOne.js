const Tool = require("../../models/tool")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { toolId } = req.params

    const result = await Tool.deleteOne({ _id: toolId, user: userID })

    if (result.deletedCount === 0) throw new Error("TOOL_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(204).send()
  } catch (error) {
    console.error(`[DELETE_TOOL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      TOOL_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Ferramenta não encontrada ou você não tem permissão para excluí-la." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = deleteOne

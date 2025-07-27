const Linker = require("../../models/linker")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { label } = req.params
    const deletedLinker = await Linker.deleteOne({ label: label.trim(), user: userID })
    if (deletedLinker.deletedCount < 1) throw new Error("LINKER_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao deletar o atalho." }
    const errorMessages = {
      LINKER_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Atalho não encontrado ou você não tem permissão para excluí-lo." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = deleteOne

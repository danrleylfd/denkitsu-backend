const Linker = require("../../models/linker")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { oldLabel } = req.params
    const { newLabel, newLink } = req.body
    const linker = await Linker.findOneAndUpdate(
      { label: oldLabel.trim(), user: userID },
      { $set: { label: newLabel.trim(), link: newLink.trim() } },
      { new: true }
    )
    if (!linker) throw new Error("LINKER_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(linker)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "LABEL_ALREADY_EXISTS", message: "O novo rótulo (label) já está em uso." }
      })
    }
    console.error(`[UPDATE_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao atualizar o atalho." }
    const errorMessages = {
      LINKER_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Atalho não encontrado ou você não tem permissão para editá-lo." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = updateOne

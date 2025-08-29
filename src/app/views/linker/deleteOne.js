const Linker = require("../../models/linker")

const createAppError = require("../../../utils/errors")

const deleteOne = async (req, res) => {
  const { user } = req
  const { label } = req.params
  const deletedLinker = await Linker.deleteOne({ label: label.trim(), user: user._id })
  if (deletedLinker.deletedCount < 1) throw createAppError("Atalho não encontrado ou você não tem permissão para excluí-lo.", 404, "LINKER_NOT_FOUND_OR_UNAUTHORIZED")
  return res.status(204).send()
}

module.exports = deleteOne

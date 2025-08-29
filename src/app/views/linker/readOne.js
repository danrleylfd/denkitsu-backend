const Linker = require("../../models/linker")
const createAppError = require("../../../utils/errors")

const readOne = async (req, res) => {
  const { label } = req.params
  const linker = await Linker.findOne({ label: label.trim() }).select("link")
  if (!linker) throw createAppError("O atalho solicitado não foi encontrado.", 404, "LINKER_NOT_FOUND")
  return res.redirect(301, linker.link)
}

module.exports = readOne

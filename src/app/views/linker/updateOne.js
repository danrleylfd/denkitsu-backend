const Linker = require("../../models/linker")
const createAppError = require("../../../utils/errors")

const updateOne = async (req, res) => {
  const { user } = req
  const { oldLabel } = req.params
  const { newLabel, newLink } = req.body
  try {
    const linker = await Linker.findOneAndUpdate(
      { label: oldLabel.trim(), user: user._id },
      { $set: { label: newLabel.trim(), link: newLink.trim() } },
      { new: true, runValidators: true }
    )
    if (!linker) throw createAppError("Atalho não encontrado ou você não tem permissão para editá-lo.", 404, "LINKER_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(linker)
  } catch (error) {
    if (error.code === 11000) throw createAppError("O novo rótulo (label) já está em uso.", 409, "LABEL_ALREADY_EXISTS")
    throw error
  }
}

module.exports = updateOne

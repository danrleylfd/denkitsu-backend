const Acquisition = require("../../models/acquisition")

const createAppError = require("../../../utils/errors")

const unacquireOne = async (req, res) => {
  const { user } = req
  const { toolId } = req.params
  const result = await Acquisition.deleteOne({ user: user._id, item: toolId })
  if (result.deletedCount === 0) throw createAppError("Você não possui esta ferramenta para removê-la.", 404, "ACQUISITION_NOT_FOUND")
  return res.status(200).json({ message: "Ferramenta removida da sua coleção." })
}

module.exports = unacquireOne

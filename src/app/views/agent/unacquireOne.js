const Acquisition = require("../../models/acquisition")

const createAppError = require("../../../utils/errors")

const unacquireOne = async (req, res) => {
  const { userID } = req
  const { agentId } = req.params
  const result = await Acquisition.deleteOne({ user: userID, item: agentId })
  if (result.deletedCount === 0) throw createAppError("Você não possui este agente para removê-lo.", 404, "ACQUISITION_NOT_FOUND")
  return res.status(200).json({ message: "Agente removido da sua coleção." })
}

module.exports = unacquireOne

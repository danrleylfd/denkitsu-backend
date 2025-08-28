const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const userAcquisitions = await Acquisition.find({ user: userID, itemType: "Tool" }).select("item").lean()
    const acquiredToolIds = userAcquisitions.map(acq => acq.item)
    const tools = await Tool.find({
      $or: [
        { author: userID },
        { _id: { $in: acquiredToolIds } }
      ]
    }).populate("author", "name avatarUrl").sort("-createdAt")
    return res.status(200).json(tools)
  } catch (error) {
    console.error(`[READ_MANY_TOOLS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readMany

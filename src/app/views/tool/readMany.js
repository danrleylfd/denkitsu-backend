const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")

const readMany = async (req, res) => {
  const { user } = req
  const userAcquisitions = await Acquisition.find({ user: user._id, itemType: "Tool" }).select("item").lean()
  const acquiredToolIds = userAcquisitions.map(acq => acq.item)
  const tools = await Tool.find({
    $or: [
      { author: user._id },
      { _id: { $in: acquiredToolIds } }
    ]
  }).populate("author", "name avatarUrl").sort("-createdAt")
  return res.status(200).json(tools)
}

module.exports = readMany

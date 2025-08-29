const Agent = require("../../models/agent")
const Acquisition = require("../../models/acquisition")

const readMany = async (req, res) => {
  const { userID } = req
  const userAcquisitions = await Acquisition.find({ user: userID, itemType: "Agent" }).select("item").lean()
  const acquiredAgentIds = userAcquisitions.map(acq => acq.item)
  const agents = await Agent.find({
    $or: [
      { author: userID },
      { _id: { $in: acquiredAgentIds } }
    ]
  }).populate("author", "name avatarUrl").sort("-createdAt")
  return res.status(200).json(agents)
}

module.exports = readMany

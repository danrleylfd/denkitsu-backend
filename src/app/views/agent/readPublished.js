const mongoose = require("mongoose")
const Agent = require("../../models/agent")

const readPublished = async (req, res) => {
  const { userID } = req
  const agents = await Agent.aggregate([
    { $match: { published: true } },
    { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorInfo" } },
    { $unwind: "$authorInfo" },
    {
      $lookup: {
        from: "acquisitions",
        let: { agentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$item", "$$agentId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(userID)] }
                ]
              }
            }
          }
        ],
        as: "userAcquisition"
      }
    },
    {
      $addFields: {
        author: { _id: "$authorInfo._id", name: "$authorInfo.name", avatarUrl: "$authorInfo.avatarUrl" },
        isAcquired: { $gt: [{ $size: "$userAcquisition" }, 0] }
      }
    },
    { $project: { authorInfo: 0, userAcquisition: 0 } },
    { $sort: { createdAt: -1 } }
  ])

  return res.status(200).json(agents)
}

module.exports = readPublished

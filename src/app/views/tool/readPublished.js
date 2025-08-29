const mongoose = require("mongoose")
const Tool = require("../../models/tool")

const readPublished = async (req, res) => {
  const { user } = req
  const tools = await Tool.aggregate([
    { $match: { published: true } },
    { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorInfo" } },
    { $unwind: "$authorInfo" },
    {
      $lookup: {
        from: "acquisitions",
        let: { toolId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$item", "$$toolId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(user._id)] }
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
  return res.status(200).json(tools)
}

module.exports = readPublished

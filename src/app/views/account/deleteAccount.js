const User = require("../../models/auth")
const Linker = require("../../models/linker")
const Video = require("../../models/video")
const Comment = require("../../models/comment")

const deleteAccount = async (req, res) => {
  const { userID } = req
  const videoIds = (await Video.find({ user: userID }).select("_id")).map(video => video._id)
  await Promise.all([
    Linker.deleteMany({ user: userID }),
    Comment.deleteMany({ video: { $in: videoIds } }),
    Video.deleteMany({ user: userID }),
    User.deleteOne({ _id: userID })
  ])
  return res.status(204).send()
}

module.exports = deleteAccount

const Video = require("../../models/video")

const readManyByUser = async (req, res) => {
  const userID = req.params.userID || req.user._id
  const videos = await Video.find({ user: userID }).sort("-createdAt").populate("user")
  return res.status(200).json(videos)
}

module.exports = readManyByUser

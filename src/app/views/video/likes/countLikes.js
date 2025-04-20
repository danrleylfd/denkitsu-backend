const mongoose = require("mongoose")
const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.aggregate([{ $match: { _id: new mongoose.Types.ObjectId(videoID) } }, { $project: { likesCount: { $size: "$likes" } } }])
    if (video.length === 0) return res.status(404).json({ error: "video not found" })
    return res.status(200).json({ likes: video[0].likesCount })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(videoID) } },
      { $project: { sharesCount: { $size: "$shares" } } }
    ])
    if (video.length === 0)
      return res.status(404).json({ error: "video id missing" })
    return res
      .status(200)
      .json({
        shares: video[0].sharesCount,
        sharesExtras: video[0].sharesExtras
      })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

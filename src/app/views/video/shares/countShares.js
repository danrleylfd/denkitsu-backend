const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.aggregate([{ $match: { _id: mongoose.Types.ObjectId(videoID) } }, { $project: { sharesCount: { $size: "$shares" } } }])
    if (video.length === 0) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json({
      shares: video[0].sharesCount,
      sharesExtras: video[0].sharesExtras
    })
  } catch (error) {
    console.error(`[COUNT_SHARES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[COUNT_SHARES] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

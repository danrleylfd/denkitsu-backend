const Video = require("../../models/video")

const readOne = async (req, res) => {
  try {
    const { video: videoID } = req.params
    if (!videoID || videoID.trim().length !== 24) throw new Error("VIDEO_MISSING")
    const video = await Video.findById(videoID).populate("user")
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json(video)
  } catch (error) {
    console.error(`[VIEW_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[VIEW_VIDEO] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video is required" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = readOne

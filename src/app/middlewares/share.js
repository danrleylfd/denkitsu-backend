const Video = require("../models/video")

module.exports = async (req, res, next) => {
  try {
    let { video: videoID } = req.params
    if (!videoID || videoID.trim().length !== 24) throw new Error("VIDEO_INVALID")
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    next()
  } catch (error) {
    console.error(`[SHARE_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[SHARE_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_INVALID: { status: 422, message: "video is missing or invalid" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

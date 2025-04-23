const Video = require("../models/video")

const videoMiddleware = async (req, res, next) => {
  try {
    const videoID = req.params.video
    if (!videoID || videoID.trim().length !== 24) throw new Error("VIDEO_MISSING")
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    next()
  } catch (error) {
    console.error(`[VIDEO_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[VIDEO_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video is required" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = videoMiddleware

const Video = require("../../models/video")

const readRecents = async (req, res) => {
  try {
    const videos = await Video.find().sort("-createdAt").populate("user").exec()
    if (!videos || videos.length === 0) throw new Error("VIDEOS_NOT_FOUND")
    return res.status(200).json(videos)
  } catch (error) {
    console.error(`[RECENT_VIDEOS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[RECENT_VIDEOS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEOS_NOT_FOUND: { status: 404, message: "videos not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = readRecents

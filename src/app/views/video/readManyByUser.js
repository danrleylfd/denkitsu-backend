const Video = require("../../models/video")

const readManyByUser = async (req, res) => {
  try {
    const { userID } = req.params || req
    const videos = await Video.find({ user: userID }).sort("-createdAt").populate("user")
    if (!videos || videos.length === 0) throw new Error("VIDEOS_NOT_FOUND")
    return res.status(200).json(videos)
  } catch (error) {
    console.error(`[VIDEOS_BY_USER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[VIDEOS_BY_USER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEOS_NOT_FOUND: { status: 404, message: "videos not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = readManyByUser

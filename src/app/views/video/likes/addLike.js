const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (!video || video.likes.includes(userID)) throw new Error("VIDEO_NOT_FOUND")
    video.likes.push(userID)
    const updatedVideo = await video.save()
    return res.status(201).json(updatedVideo)
  } catch (error) {
    console.error(`[POST_LIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[POST_LIKE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "video not found" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

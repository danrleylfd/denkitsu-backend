const Video = require("../../../models/video")

const addLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (video.likes.includes(userID)) throw new Error("VIDEO_ALREADY_LIKED")
    video.likes.push(userID)
    const updatedVideo = await video.save()
    return res.status(201).json(updatedVideo)
  } catch (error) {
    console.error(`[LIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[LIKE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_ALREADY_LIKED: { status: 404, message: "video already liked" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = addLike

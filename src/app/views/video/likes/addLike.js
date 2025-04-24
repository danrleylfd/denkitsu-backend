const Video = require("../../../models/video")

const addLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findOneAndUpdate(
      { _id: videoID, likes: { $ne: userID } },
      { $addToSet: { likes: userID } },
      { new: true }
    ).select("_id")
    if (!video) throw new Error("VIDEO_NOT_FOUND_OR_ALREADY_LIKED")
    return res.status(201).json({ success: true })
  } catch (error) {
    console.error(`[LIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[LIKE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_ALREADY_LIKED: { status: 409, message: "Video not found/exists or already liked by this user" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = addLike

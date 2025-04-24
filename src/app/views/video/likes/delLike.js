const Video = require("../../../models/video")

const delLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findOneAndUpdate(
      { _id: videoID, likes: userID },
      { $pull: { likes: userID } },
      { new: true }
    ).populate("user")
    if (!video) throw new Error("VIDEO_NOT_FOUND_OR_NOT_LIKED")
    return res.status(204).json(video)
  } catch (error) {
    console.error(`[UNLIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[UNLIKE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_NOT_LIKED: { status: 404, message: "video not found/exists or you didn't like this video" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = delLike

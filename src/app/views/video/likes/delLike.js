const Video = require("../../../models/video")

const delLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (!video.likes.includes(userID)) throw new Error("VIDEO_NOT_LIKED")
    await Video.updateOne({ _id: videoID }, { $pull: { likes: userID } }, { new: true })
    const updatedVideo = await Video.findById(videoID).populate("user")
    return res.status(200).json(updatedVideo)
  } catch (error) {
    console.error(`[UNLIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[UNLIKE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_LIKED: { status: 422, message: "you didn't like this video" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = delLike

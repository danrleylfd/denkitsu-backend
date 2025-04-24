const Video = require("../../models/video")
const Comment = require("../../models/comment")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    if (!videoID || videoID.trim().length !== 24) throw new Error("VIDEO_MISSING")
    const [ _, deletedVideo ] = await Promise.all([
      Comment.deleteMany({ video: videoID }),
      Video.deleteOne({ _id: videoID, user: userID })
    ])
    if (!deletedVideo) throw new Error("VIDEO_NOT_FOUND")
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_VIDEO] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video is required" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists or you are not the owner of this video" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = deleteOne

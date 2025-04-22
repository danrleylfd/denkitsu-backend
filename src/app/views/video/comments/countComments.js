const { ObjectId } = require("../../../../utils/database")
const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const [ video ] = await Video.aggregate([{ $match: { _id: ObjectId(videoID) } }, { $project: { commentsCount: { $size: "$comments" } } }])
    return res.status(200).json({ comments: video.commentsCount })
  } catch (error) {
    console.error(`[COUNT_COMMENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[COUNT_COMMENTS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

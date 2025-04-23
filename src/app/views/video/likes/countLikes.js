const { Types: { ObjectId } } = require("../../../../utils/database")
const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const [ video ] = await Video.aggregate([{ $match: { _id: videoID } }, { $project: { likesCount: { $size: "$likes" } } }])
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json({ likes: video.likesCount })
  } catch (error) {
    console.error(`[COUNT_LIKES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[COUNT_LIKES] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

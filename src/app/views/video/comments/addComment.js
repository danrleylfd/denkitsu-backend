const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const { content } = req.body
    if (!content || content.trim().length === 0) throw new Error("INVALID_COMMENT")
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    const comment = await Comment.create({
      content,
      user: userID,
      video: videoID
    })
    video.comments.push(comment._id)
    await video.save()
    return res.status(201).json(comment)
  } catch (error) {
    console.error(`[POST_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[POST_COMMENT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment missing or invalid" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

const delComment = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID, comment: commentID } = req.params
    if (!commentID || commentID.length !== 24) throw new Error("INVALID_COMMENT")
    const comment = await Comment.findById(commentID)
    if (comment.user !== userID) throw new Error("UNAUTHORIZED")
    const video = await Video.findById(videoID)
    video.comments = video.comments.filter((commentId) => commentId.toString() !== commentID)
    await video.save()
    await Comment.deleteMany({ parent: commentID })
    await Comment.findByIdAndDelete(commentID)
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_COMMENT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment missing or invalid" },
      UNAUTHORIZED: { status: 401, message: "you are not the author of this comment" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = delComment

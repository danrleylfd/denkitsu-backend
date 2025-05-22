const Comment = require("../../../models/comment")

const countComments = async (req, res) => {
  try {
    const { comment: commentID } = req.params
    const comments = await Comment.find({ parent: commentID }).sort("-createdAt").populate("user")
    if (!comments) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json(comments)
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

module.exports = countComments

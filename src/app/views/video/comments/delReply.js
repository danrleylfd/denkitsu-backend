const Comment = require("../../../models/comment")

const delReply = async (req, res) => {
  try {
    const { userID } = req
    const { reply: replyID } = req.params
    const reply = await Comment.findById(replyID).populate("parent").populate("user")
    if (!reply) throw new Error("REPLY_NOT_FOUND")
    if (reply.user._id.toString() !== userID) throw new Error("UNAUTHORIZED")
    const comment = reply.parent
    if (!comment) throw new Error("COMMENT_NOT_FOUND")
    comment.replies = comment.replies.filter((replyId) => replyId != replyID)
    await Promise.all([
      comment.save(),
      Comment.findByIdAndDelete(replyID)
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_REPLY] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_REPLY] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment missing or invalid" },
      UNNAUTHORIZED: { status: 401, message: "you are not the author of this reply" },
      COMMENT_NOT_FOUND: { status: 404, message: "comment not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = delReply

const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { reply: replyID } = req.params
    const reply = await Comment.findById(replyID).populate("parent")
    if (!reply) throw new Error("REPLY_NOT_FOUND")
    if (reply.user != userID) throw new Error("UNAUTHORIZED")
    const comment = reply.parent
    if (!comment) throw new Error("COMMENT_NOT_EXISTS")
    comment.replies = comment.replies.filter((replyId) => replyId != replyID)
    await promise.all([
      comment.save(),
      reply.delete()
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_REPLY] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_REPLY] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment missing or invalid." },
      UNNAUTHORIZED: { status: 401, message: "You are not the author of this reply" },
      COMMENT_NOT_EXISTS: { status: 404, message: "Comment not exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

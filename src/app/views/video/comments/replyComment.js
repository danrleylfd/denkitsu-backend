const Comment = require("../../../models/comment")

const replyComment = async (req, res) => {
  try {
    const { userID } = req
    const { comment: commentID } = req.params
    if (commentID?.length < 24) throw new Error("COMMENT_MISSING")
    const { content } = req.body
    if (!content?.trim()) throw new Error("CONTENT_MISSING")
    const comment = await Comment.findById(commentID)
    if (comment.parent) throw new Error("IMPOSSIBLE_REPLY")
    const reply = await Comment.create({
      content,
      user: userID,
      parent: commentID
    })
    comment.replies.push(reply._id)
    await comment.save()
    return res.status(201).json(comment)
  } catch (error) {
    console.error(`[REPLY_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[REPLY_COMMENT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      COMMENT_MISSING: { status: 422, message: "comment missing or invalid" },
      CONTENT_MISSING: { status: 422, message: "content is required" },
      IMPOSSIBLE_REPLY: { status: 400, message: "it is not possible to respond to a reply from another comment" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = replyComment

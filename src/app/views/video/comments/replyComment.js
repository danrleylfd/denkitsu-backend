const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { comment: commentID } = req.params
    const { content } = req.body
    if (!content || content.trim().length === 0) throw new Error("INVALID_COMMENT")
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
    console.error(`[POST_REPLY] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[POST_REPLY] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment missing or invalid." },
      IMPOSSIBLE_REPLY: { status: 400, message: "It is not possible to respond to a reply from another comment" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

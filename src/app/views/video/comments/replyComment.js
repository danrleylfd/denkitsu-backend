const Comment = require("../../../models/comment")

const replyComment = async (req, res) => {
  try {
    const { userID } = req
    const { comment: commentID } = req.params
    const { content } = req.body
    const comment = await Comment.findById(commentID)
    if (comment.parent) throw new Error("IMPOSSIBLE_REPLY")
    const reply = await Comment.create({ content, user: userID, parent: commentID })
    comment.replies.push(reply._id)
    await comment.save()
    const populatedReply = await reply.populate("user")
    return res.status(201).json(populatedReply)
  } catch (error) {
    console.error(`[REPLY_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao responder o comentário." }
    const errorMessages = {
      IMPOSSIBLE_REPLY: { status: 400, message: "Não é possível responder a uma resposta de outro comentário." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = replyComment

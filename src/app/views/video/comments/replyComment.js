const Comment = require("../../../models/comment")
const createAppError = require("../../../../utils/errors")

const replyComment = async (req, res) => {
  const { userID } = req
  const { comment: commentID } = req.params
  const { content } = req.body
  const parentComment = await Comment.findById(commentID)
  if (parentComment.parent) throw createAppError("Não é possível responder a uma resposta de outro comentário.", 400, "CANNOT_REPLY_TO_REPLY")
  const reply = await Comment.create({
    content: content.trim(),
    user: userID,
    parent: commentID,
    video: parentComment.video
  })
  parentComment.replies.push(reply._id)
  await parentComment.save()
  const populatedReply = await reply.populate("user")
  return res.status(201).json(populatedReply)
}

module.exports = replyComment

const Comment = require("../../../models/comment")

const createAppError = require("../../../../utils/errors")

const delComment = async (req, res) => {
  const { user } = req
  const { comment: commentID } = req.params
  const deletedComment = await Comment.findOneAndDelete({ _id: commentID, user: user._id })
  if (!deletedComment) throw createAppError("Comentário não encontrado ou você não tem permissão para excluí-lo.", 404, "COMMENT_NOT_FOUND_OR_UNAUTHORIZED")
  await Promise.all([
    deletedComment.parent && Comment.updateOne({ _id: deletedComment.parent }, { $pull: { replies: deletedComment._id } }),
    !deletedComment.parent && Comment.deleteMany({ parent: commentID })
  ])
  return res.status(204).send()
}

module.exports = delComment

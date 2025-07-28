const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

const delComment = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID, comment: commentID } = req.params
    const deletedComment = await Comment.findOneAndDelete({ _id: commentID, user: userID })
    if (!deletedComment) throw new Error("COMMENT_NOT_FOUND_OR_UNAUTHORIZED")
    await Promise.all([
      deletedComment.parent && Comment.updateOne({ _id: deletedComment.parent }, { $pull: { replies: deletedComment._id } } ),
      !deletedComment.parent && Comment.deleteMany({ parent: commentID }),
      !deletedComment.parent && Video.updateOne({ _id: videoID }, { $pull: { comments: commentID } })
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      COMMENT_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Comentário não encontrado ou você não tem permissão para excluí-lo." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = delComment

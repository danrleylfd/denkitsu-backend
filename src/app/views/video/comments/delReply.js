const Comment = require("../../../models/comment")

const delReply = async (req, res) => {
  try {
    const { userID } = req
    const { reply: replyID } = req.params
    const reply = await Comment.findOne({ _id: replyID })
    if (!reply) throw new Error("REPLY_NOT_FOUND")
    if (reply.user.toString() !== userID.toString()) throw new Error("UNAUTHORIZED")
    const parentComment = await Comment.findById(reply.parent)
    if (parentComment) {
      parentComment.replies.pull(replyID)
      await parentComment.save()
    }
    await Comment.findByIdAndDelete(replyID)
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_REPLY] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao deletar a resposta." }
    const errorMessages = {
      REPLY_NOT_FOUND: { status: 404, message: "Resposta não encontrada." },
      UNAUTHORIZED: { status: 403, message: "Você não tem permissão para excluir esta resposta." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = delReply

const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { id: userID } = req.query
    const { comment: commentID, reply: replyID } = req.params
    // Retorna se o usuário não houver enviado o id do comentário:
    if (!replyID || replyID.trim().length === 0)
      return res.status(422).json({ error: "reply id missing" })
    // Retorna se o usuário logado não for o author deste comentário:
    const reply = await Comment.findById(replyID)
    if (reply.user !== userID)
      return res.status(401).json({ error: "You are not the author of this reply" })
    // Remove essa resposta do comentário pai:
    const comment = await Comment.findById(commentID)
    comment.replies = comment.replies.filter((replyId) => replyId !== replyID)
    await comment.save()
    // Deleta esta resposta:
    await Comment.findByIdAndDelete(replyID)
    return res.status(204).json({ message: "Successfully deleted" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

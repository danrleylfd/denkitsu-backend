const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { reply: replyID } = req.params
    const reply = await Comment.findById(replyID).populate("parent")
    if (!reply) return res.status(404).json({ error: "Reply not found" })
    if (reply.user != userID) return res.status(401).json({ error: "You are not the author of this reply" })
    const comment = reply.parent
    if (!comment) return res.status(404).json({ error: "Comment not exists" })
    comment.replies = comment.replies.filter((replyId) => replyId != replyID)
    await comment.save()
    await reply.delete()
    return res.status(204).send()
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

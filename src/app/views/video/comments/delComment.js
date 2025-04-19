const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { id: userID } = req
    const { comment: commentID, video: videoID } = req.params
    // Retorna se o usuário não houver enviado o id do comentário:
    if (!commentID || commentID.trim().length === 0)
      return res.status(422).json({ error: "comment id missing" })
    // Retorna se o usuário logado não for o author deste comentário:
    const comment = await Comment.findById(commentID)
    if (comment.user !== userID)
      return res.status(401).json({ error: "You are not the author of this comment" })
    // Remove este comentário do video:
    const video = await Video.findById(videoID)
    video.comments = video.comments.filter((commentId) => commentId !== commentID)
    await video.save()
    // Deleta as respostas deste comentário:
    await Comment.deleteMany({ parent: commentID })
    // Deleta este comentário:
    await Comment.findByIdAndDelete(commentID)
    return res.status(204).json({ message: "Successfully deleted" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

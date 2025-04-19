const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { userID } = req.query
    const { video: videoID, comment: commentID } = req.params
    const { content } = req.body
    // Retorna se o usuário não houver enviado o content do video:
    if (!content || content.trim().length === 0)
      return res.status(422).json({ error: "content missing" })
    // Retorna se o video não for encontrado:
    const video = await Video.findById(videoID)
    if (!video) return res.status(404).json({ error: "video not found" })
    // Publica a resposta do comentário:
    const comment = await Comment.findById(commentID)
    if (!comment.parent) {
      const reply = await Comment.create({
        content,
        user: userID,
        parent: commentID
      })
      // Adiciona a resposta ao comentário:
      comment.replies.push(reply._id)
      await comment.save()
      return res.status(201).json(comment)
    }
    return res
      .status(400)
      .json({ error: "It is not possible to respond to a reply from another comment" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

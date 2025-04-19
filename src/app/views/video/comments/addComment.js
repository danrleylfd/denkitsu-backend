const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

module.exports = async (req, res) => {
  try {
    const { id: userID } = req
    const { video: videoID } = req.params
    const { content } = req.body
    // Retorna se o usuário não houver enviado o content do video:
    if (!content || content.trim().length === 0)
      return res.status(422).json({ error: "content missing" })
    // Retorna se o video não for encontrado:
    const video = await Video.findById(videoID)
    if (!video) return res.status(404).json({ error: "video not found" })
    // Publica o comentário:
    const comment = await Comment.create({
      content,
      user: userID,
      video: videoID
    })
    // Adiciona o comentário ao vídeo:
    video.comments.push(comment._id)
    await video.save()
    return res.status(201).json(comment)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

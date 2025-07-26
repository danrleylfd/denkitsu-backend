const Comment = require("../../../models/comment")

const listComments = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const comments = await Comment.find({ video: videoID }).sort("-createdAt").populate("user")
    return res.status(200).json(comments)
  } catch (error) {
    console.error(`[LIST_COMMENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao listar os comentários." } })
  }
}

module.exports = listComments

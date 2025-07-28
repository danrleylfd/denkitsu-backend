const Comment = require("../../../models/comment")

const listReplies = async (req, res) => {
  try {
    const { comment: commentID } = req.params
    const replies = await Comment.find({ parent: commentID }).sort("-createdAt").populate("user")
    return res.status(200).json(replies)
  } catch (error) {
    console.error(`[LIST_REPLIES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao listar as respostas." }
    })
  }
}

module.exports = listReplies

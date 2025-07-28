const Comment = require("../../../models/comment")

const listReplies = async (req, res) => {
  try {
    const { comment: commentID } = req.params
    const replies = await Comment.find({ parent: commentID }).sort("-createdAt").populate("user")
    return res.status(200).json(replies)
  } catch (error) {
    console.error(`[LIST_REPLIES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = listReplies

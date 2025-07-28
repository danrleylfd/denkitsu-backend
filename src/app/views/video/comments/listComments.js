const Comment = require("../../../models/comment")

const listComments = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const comments = await Comment.find({ video: videoID }).sort("-createdAt").populate("user")
    return res.status(200).json(comments)
  } catch (error) {
    console.error(`[LIST_COMMENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = listComments

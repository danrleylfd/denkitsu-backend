const Comment = require("../../../models/comment")

const countComments = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const commentsCount = await Comment.countDocuments({ video: videoID, parent: null })
    return res.status(200).json({ comments: commentsCount })
  } catch (error) {
    console.error(`[COUNT_COMMENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}
module.exports = countComments

const Like = require("../../../models/like")

const countLikes = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const likesCount = await Like.countDocuments({ video: videoID })
    return res.status(200).json({ likes: likesCount })
  } catch (error) {
    console.error(`[COUNT_LIKES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = countLikes

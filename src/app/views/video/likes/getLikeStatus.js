const Like = require("../../../models/like")

const getLikeStatus = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const like = await Like.findOne({ user: userID, video: videoID })
    return res.status(200).json({ isLiked: !!like })
  } catch (error) {
    console.error(`[GET_LIKE_STATUS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: error.message, message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = getLikeStatus

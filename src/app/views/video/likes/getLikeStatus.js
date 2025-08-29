const Like = require("../../../models/like")

const getLikeStatus = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  const like = await Like.findOne({ user: userID, video: videoID })
  return res.status(200).json({ isLiked: !!like })
}

module.exports = getLikeStatus

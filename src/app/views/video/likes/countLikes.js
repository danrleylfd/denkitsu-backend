const Like = require("../../../models/like")

const countLikes = async (req, res) => {
  const { video: videoID } = req.params
  const likesCount = await Like.countDocuments({ video: videoID })
  return res.status(200).json({ likes: likesCount })
}

module.exports = countLikes

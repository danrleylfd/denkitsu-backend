const Comment = require("../../../models/comment")

const countComments = async (req, res) => {
  const { video: videoID } = req.params
  const commentsCount = await Comment.countDocuments({ video: videoID, parent: null })
  return res.status(200).json({ comments: commentsCount })
}
module.exports = countComments

const Comment = require("../../../models/comment")

const listComments = async (req, res) => {
  const { video: videoID } = req.params
  const comments = await Comment.find({ video: videoID }).sort("-createdAt").populate("user")
  return res.status(200).json(comments)
}

module.exports = listComments

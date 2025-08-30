const Comment = require("../../../models/comment")

const listReplies = async (req, res) => {
  const { comment: commentID } = req.params
  const replies = await Comment.find({ parent: commentID }).sort("-createdAt").populate("user")
  return res.status(200).json(replies)
}

module.exports = listReplies

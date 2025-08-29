const Comment = require("../../../models/comment")

const addComment = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  const { content } = req.body
  let comment = await Comment.create({
    content: content.trim(),
    user: userID,
    video: videoID
  })

  comment = await comment.populate("user")
  return res.status(201).json(comment)
}

module.exports = addComment

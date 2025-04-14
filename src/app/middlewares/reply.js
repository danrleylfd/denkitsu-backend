module.exports = (req, res, next) => {
  let { comment: commentID } = req.params
  commentID = commentID.trim()
  if (!commentID || commentID.length === 0) return next()
  return res.status(422).json({ error: "comment id missing." })
}

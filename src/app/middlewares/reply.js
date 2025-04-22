module.exports = (req, res, next) => {
  const { video: videoID, comment: commentID, reply: replyID } = req.params
  if (videoID.length < 24) return res.status(422).json({ error: "video id missing" })
  if (commentID.length < 24) return res.status(422).json({ error: "comment id missing" })
  if (replyID.length < 24) return res.status(422).json({ error: "reply id missing" })
  next()
}

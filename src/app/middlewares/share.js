module.exports = (req, res, next) => {
  let { video: videoID } = req.params
  if (!videoID || videoID.length === 0) return res.status(422).json({ error: "video id missing" })
  req.params.video = req.params.video.trim()
  return next()
}

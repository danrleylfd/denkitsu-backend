const Video = require("../../models/video")

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    if (!videoID || videoID.length < 24) return res.status(422).json({ error: "video id missing" })
    const video = await Video.findById(videoID).populate("user").exec()
    if (!video) return res.status(404).json({ error: "video not found" })
    return res.status(200).json(video)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

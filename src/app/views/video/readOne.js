const Video = require("../../models/video")

const isEmpty = (value) => !value || value.trim().length === 0

module.exports = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user").exec()
    if (!video) return res.status(404).json({ error: "video not found" })
    return res.status(200).json(video)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

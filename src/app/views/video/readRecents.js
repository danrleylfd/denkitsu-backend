const Video = require("../../models/video")

module.exports = async (req, res) => {
  try {
    const videos = await Video.find().sort("-createdAt").populate("user").exec()
    if (!videos || videos.length === 0) return res.status(404).json({ error: "videos not found." })
    return res.status(200).json(videos)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

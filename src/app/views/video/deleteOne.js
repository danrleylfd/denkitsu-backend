const Video = require("../../models/video")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    if (!videoID || videoID.length < 24) return res.status(422).json({ error: "video id missing" })
    await Video.findOneAndDelete({ _id: videoID, user: userID })
    return res.status(204).json({ message: "Successfully deleted" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

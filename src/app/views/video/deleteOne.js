const Video = require("../../models/video")

const isEmpty = (value) => !value || value.trim().length === 0

module.exports = async (req, res) => {
  try {
    const { user: userID } = req.query
    const { video: videoID } = req.params
    await Video.findOneAndDelete({ _id: videoID, user: userID })
    return res.status(204).json({ message: "Successfully deleted" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

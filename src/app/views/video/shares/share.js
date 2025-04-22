const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    if (!videoID || videoID.length < 24) return res.status(422).json({ error: "Invalid video ID" })
    const video = await Video.findById(videoID).populate("user")
    if (!video) return res.status(404).json({ error: "video not found" })
    if (!video.shares.includes(userID)) video.shares.push(userID)
    else video.sharesExtras += 1
    const updatedVideo = await video.save()
    return res.status(201).json(updatedVideo)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

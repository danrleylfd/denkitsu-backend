const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { id: userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (!video || video.likes.includes(userID))
      return res.status(422).json({ error: "You already liked this video" })
    video.likes.push(userID)
    const updatedVideo = await video.save()
    return res.status(201).json(updatedVideo)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

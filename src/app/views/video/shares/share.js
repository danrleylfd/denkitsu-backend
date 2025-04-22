const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (!video) return res.status(404).json({ error: "video not found/exists" })
    if (!video.shares.includes(userID)) video.shares.push(userID)
    else video.sharesExtras += 1
    const updatedVideo = await video.save()
    return res.status(201).json(updatedVideo)
  } catch (error) {
    console.error(`[SHARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[SHARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

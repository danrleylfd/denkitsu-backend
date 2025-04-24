const Video = require("../../models/video")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    if (!videoID || videoID.length !== 24) throw new Error("VIDEO_MISSING")
    const { content, coverUrl, fileUrl } = req.body
    if (!content?.trim()) throw new Error("CONTENT_MISSING")
    if (!coverUrl?.trim()) throw new Error("COVER_URL_MISSING")
    if (!fileUrl?.trim()) throw new Error("FILE_URL_MISSING")
    const video = await Video.findOneAndUpdate(
      { _id: videoID, user: userID },
      { $set: { content, coverUrl, fileUrl } },
      { new: true }
    )
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json(video)
  } catch (error) {
    console.error(`[UPDATE_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[UPDATE_VIDEO] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video is required" },
      CONTENT_MISSING: { status: 422, message: "content is required" },
      COVER_URL_MISSING: { status: 422, message: "coverUrl is required" },
      FILE_URL_MISSING: { status: 422, message: "fileUrl is required" },
      VIDEO_NOT_FOUND: { status: 404, message: "video not found/exists or you are not the owner" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = updateOne

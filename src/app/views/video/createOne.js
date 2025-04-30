const Video = require("../../models/video")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const { content, coverUrl, fileUrl } = req.body
    if (!content?.trim()) throw new Error("CONTENT_MISSING")
    if (!coverUrl?.trim()) throw new Error("COVER_URL_MISSING")
    if (!fileUrl?.trim()) throw new Error("FILE_URL_MISSING")
    const video = await Video.create({
      user: userID,
      content: content.trim(),
      coverUrl: coverUrl.trim(),
      fileUrl: fileUrl.trim()
    })
    const populatedVideo = await video.populate("user")
    return res.status(201).json(populatedVideo)
  } catch (error) {
    console.error(`[POST_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[POST_VIDEO] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      CONTENT_MISSING: { status: 422, message: "content is required." },
      COVER_URL_MISSING: { status: 422, message: "coverUrl is required." },
      FILE_URL_MISSING: { status: 422, message: "fileUrl is required." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = createOne

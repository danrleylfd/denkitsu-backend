const Video = require("../../models/video")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const { content, thumbnail, fileUrl } = req.body
    const video = await Video.create({
      user: userID,
      content: content.trim(),
      thumbnail: thumbnail.trim(),
      fileUrl: fileUrl.trim()
    })
    const populatedVideo = await video.populate("user")
    return res.status(201).json(populatedVideo)
  } catch (error) {
    console.error(`[POST_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne

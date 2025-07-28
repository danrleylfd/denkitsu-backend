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
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao criar o vídeo." }
    })
  }
}

module.exports = createOne

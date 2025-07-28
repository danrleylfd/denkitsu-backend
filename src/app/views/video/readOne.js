const Video = require("../../models/video")

const readOne = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    return res.status(200).json(video)
  } catch (error) {
    console.error(`[VIEW_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "Vídeo não encontrado." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readOne

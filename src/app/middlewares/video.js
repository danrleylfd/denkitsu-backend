const Video = require("../models/video")

const videoMiddleware = async (req, res, next) => {
  try {
    const { video: videoID } = req.params
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    next()
  } catch (error) {
    console.error(`[VIDEO_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      VIDEO_NOT_FOUND: { status: 404, message: "O vídeo especificado não foi encontrado ou não existe." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = videoMiddleware

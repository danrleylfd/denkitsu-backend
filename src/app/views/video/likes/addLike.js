const Like = require("../../../models/like")
const Video = require("../../../models/video")

const addLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND_OR_ALREADY_LIKED")
    await Like.findOneAndUpdate(
      { user: userID, video: videoID },
      { user: userID, video: videoID },
      { upsert: true }
    )
    return res.status(201).send()
  } catch (error) {
    console.error(`[LIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_ALREADY_LIKED: { status: 409, message: "Vídeo não encontrado ou já curtido por este usuário." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = addLike

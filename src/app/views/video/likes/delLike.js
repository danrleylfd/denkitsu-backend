const Video = require("../../../models/video")

const delLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findOneAndUpdate(
      { _id: videoID, likes: userID },
      { $pull: { likes: userID } },
      { new: true }
    ).select("_id")
    if (!video) throw new Error("VIDEO_NOT_FOUND_OR_NOT_LIKED")
    return res.status(204).send()
  } catch (error) {
    console.error(`[UNLIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao descurtir o vídeo." }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_NOT_LIKED: { status: 404, message: "Vídeo não encontrado ou não curtido por este usuário." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = delLike

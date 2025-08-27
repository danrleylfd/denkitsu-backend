const Like = require("../../../models/like")

const delLike = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const result = await Like.deleteOne({ user: userID, video: videoID })
    if (result.deletedCount === 0) throw new Error("VIDEO_NOT_FOUND_OR_NOT_LIKED")
    return res.status(204).send()
  } catch (error) {
    console.error(`[UNLIKE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_NOT_LIKED: { status: 404, message: "Vídeo não encontrado ou não curtido por este usuário." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = delLike

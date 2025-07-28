const Video = require("../../models/video")
const Comment = require("../../models/comment")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const deletedVideoResult = await Video.deleteOne({ _id: videoID, user: userID })
    if (deletedVideoResult.deletedCount === 0) throw new Error("VIDEO_NOT_FOUND_OR_UNAUTHORIZED")
    await Comment.deleteMany({ video: videoID })
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao deletar o vídeo." }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Vídeo não encontrado ou você não tem permissão para excluí-lo." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = deleteOne

const Video = require("../../models/video")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const { content, thumbnail, fileUrl } = req.body
    const video = await Video.findOneAndUpdate(
      { _id: videoID, user: userID },
      { $set: { content, thumbnail, fileUrl } },
      { new: true }
    )
    if (!video) throw new Error("VIDEO_NOT_FOUND_OR_UNAUTHORIZED")
    return res.status(200).json(video)
  } catch (error) {
    console.error(`[UPDATE_VIDEO] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado ao atualizar o vídeo." }
    const errorMessages = {
      VIDEO_NOT_FOUND_OR_UNAUTHORIZED: { status: 404, message: "Vídeo não encontrado ou você não tem permissão para editá-lo." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = updateOne

const Video = require("../../models/video")

const readManyByUser = async (req, res) => {
  try {
    const userID = req.params.userID || req.userID
    const videos = await Video.find({ user: userID }).sort("-createdAt").populate("user")
    return res.status(200).json(videos)
  } catch (error) {
    console.error(`[VIDEOS_BY_USER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao buscar os vídeos." }
    })
  }
}

module.exports = readManyByUser

const Video = require("../../models/video")

const createAppError = require("../../../utils/errors")

const readRecents = async (req, res) => {
  const videos = await Video.find().sort("-createdAt").populate("user")
  if (!videos || videos.length === 0) throw createAppError("Nenhum vídeo foi encontrado.", 404, "VIDEOS_NOT_FOUND")
  return res.status(200).json(videos)
}

module.exports = readRecents

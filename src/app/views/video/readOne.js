const Video = require("../../models/video")

const createAppError = require("../../../utils/errors")

const readOne = async (req, res) => {
  const { video: videoID } = req.params
  const video = await Video.findById(videoID).populate("user")
  if (!video) throw createAppError("Vídeo não encontrado.", 404, "VIDEO_NOT_FOUND")
  return res.status(200).json(video)
}

module.exports = readOne

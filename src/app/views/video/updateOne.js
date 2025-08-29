const Video = require("../../models/video")

const createAppError = require("../../../utils/errors")

const updateOne = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  const { content, thumbnail, fileUrl } = req.body
  const video = await Video.findOneAndUpdate(
    { _id: videoID, user: userID },
    { $set: { content, thumbnail, fileUrl } },
    { new: true }
  )
  if (!video) throw createAppError("Vídeo não encontrado ou você não tem permissão para editá-lo.", 404, "VIDEO_NOT_FOUND_OR_UNAUTHORIZED")
  return res.status(200).json(video)
}

module.exports = updateOne

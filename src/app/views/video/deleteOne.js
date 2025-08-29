const Video = require("../../models/video")
const Comment = require("../../models/comment")

const createAppError = require("../../../utils/errors")

const deleteOne = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  const deletedVideoResult = await Video.deleteOne({ _id: videoID, user: userID })
  if (deletedVideoResult.deletedCount === 0) throw createAppError("Vídeo não encontrado ou você não tem permissão para excluí-lo.", 404, "VIDEO_NOT_FOUND_OR_UNAUTHORIZED")
  await Comment.deleteMany({ video: videoID })
  return res.status(204).send()
}

module.exports = deleteOne

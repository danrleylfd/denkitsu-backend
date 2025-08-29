const Like = require("../../../models/like")

const createAppError = require("../../../../utils/errors")

const delLike = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  const result = await Like.deleteOne({ user: userID, video: videoID })
  if (result.deletedCount === 0) throw createAppError("Vídeo não encontrado ou não curtido por este usuário.", 404, "VIDEO_NOT_FOUND_OR_NOT_LIKED")
  return res.status(204).send()
}

module.exports = delLike

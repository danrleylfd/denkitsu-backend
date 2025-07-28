const { Types: { ObjectId } } = require("../../../../utils/database")

const Video = require("../../../models/video")

const countLikes = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const [ video ] = await Video.aggregate([
      { $match: { _id: new ObjectId(videoID) } },
      { $project: { likesCount: { $size: "$likes" } } }
    ])
    return res.status(200).json({ likes: video.likesCount })
  } catch (error) {
    console.error(`[COUNT_LIKES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = countLikes

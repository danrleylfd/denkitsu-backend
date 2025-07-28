const { Types: { ObjectId } } = require("../../../../utils/database")

const Video = require("../../../models/video")

const countComments = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const [ video ] = await Video.aggregate([
      { $match: { _id: new ObjectId(videoID) } },
      { $project: { commentsCount: { $size: "$comments" } } }
    ])
    return res.status(200).json({ comments: video.commentsCount })
  } catch (error) {
    console.error(`[COUNT_COMMENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}
module.exports = countComments

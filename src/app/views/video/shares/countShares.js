const { Types: { ObjectId } } = require("../../../../utils/database")

const Video = require("../../../models/video")

const countShares = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const [ video ] = await Video.aggregate([
      { $match: { _id: new ObjectId(videoID) } },
      { $project: { sharesCount: { $size: "$shares" }, sharesExtras: 1 } }
    ])
    return res.status(200).json({
      shares: video.sharesCount,
      sharesExtras: video.sharesExtras
    })
  } catch (error) {
    console.error(`[COUNT_SHARES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao contar os compartilhamentos." }
    })
  }
}

module.exports = countShares

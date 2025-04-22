const User = require("../../models/auth")
const Video = require("../../models/video")

module.exports = async (req, res) => {
  try {
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - 365) // 1 = 1 Dia = Últimas 24 horas
    const videos = await Video.aggregate([
      {
        $match: {
          createdAt: { $gte: dateLimit }
        }
      },
      {
        $addFields: {
          popularity: {
            $sum: [{ $multiply: [{ $size: "$likes" }, 2] }, { $multiply: [{ $size: "$comments" }, 3] }, { $multiply: [{ $size: "$shares" }, 5] }]
          }
        }
      },
      { $sort: { popularity: -1, updatedAt: -1, createdAt: -1 } },
      { $limit: 16 }
    ]).exec()
    if (!videos || videos.length === 0) throw new Error("VIDEOS_NOT_FOUND")
    const videosWithUsers = []
    for (let pos = 0; pos < videos.length; pos++) {
      const video = videos[pos]
      const user = await User.findById(video.user)
      videosWithUsers.push({ ...video, user })
    }
    return res.status(200).json(videosWithUsers)
  } catch (error) {
    console.error(`[POPULAR_VIDEOS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[POPULAR_VIDEOS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEOS_NOT_FOUND: { status: 404, message: "videos not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

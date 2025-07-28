const Video = require("../../models/video")

const readPopular = async (req, res) => {
  try {
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - 10000) // 1 = 1 Dia = Últimas 24 horas
    const videos = await Video.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $addFields: {
          popularity: {
            $sum: [
              { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 2] },
              { $multiply: [{ $size: { $ifNull: ["$comments", []] } }, 3] },
              { $multiply: [{ $size: { $ifNull: ["$shares", []] } }, 5] }
            ]
          }
        }
      },
      { $sort: { popularity: -1, updatedAt: -1, createdAt: -1 } },
      { $limit: 33 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: "$userData" },
      { $addFields: { user: "$userData" } },
      { $project: { userData: 0 } }
    ])
    if (!videos || videos.length === 0) throw new Error("VIDEOS_NOT_FOUND")
    return res.status(200).json(videos)
  } catch (error) {
    console.error(`[POPULAR_VIDEOS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      VIDEOS_NOT_FOUND: { status: 404, message: "Nenhum vídeo foi encontrado." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = readPopular

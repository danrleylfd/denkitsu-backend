const Video = require("../../models/video")

const createAppError = require("../../../utils/errors")

const readPopular = async (req, res) => {
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
  if (!videos || videos.length === 0) throw createAppError("Nenhum vídeo foi encontrado.", 404, "VIDEOS_NOT_FOUND")
  return res.status(200).json(videos)
}

module.exports = readPopular

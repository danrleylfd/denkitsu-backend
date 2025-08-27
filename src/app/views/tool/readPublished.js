const mongoose = require("mongoose")
const Tool = require("../../models/tool")

const readPublished = async (req, res) => {
  try {
    const { userID } = req
    const tools = await Tool.aggregate([
      // Encontra todas as ferramentas publicadas, exceto as do próprio usuário
      {
        $match: {
          published: true,
          author: { $ne: new mongoose.Types.ObjectId(userID) }
        }
      },
      // Popula os dados do autor
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo"
        }
      },
      // Desconstrói o array do autor para ser um objeto
      { $unwind: "$authorInfo" },
      // Verifica se o usuário atual adquiriu esta ferramenta
      {
        $lookup: {
          from: "acquisitions",
          let: { toolId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$item", "$$toolId"] },
                    { $eq: ["$user", new mongoose.Types.ObjectId(userID)] }
                  ]
                }
              }
            }
          ],
          as: "userAcquisition"
        }
      },
      // Adiciona um campo booleano 'isAcquired' e formata o autor
      {
        $addFields: {
          author: {
            _id: "$authorInfo._id",
            name: "$authorInfo.name",
            avatarUrl: "$authorInfo.avatarUrl"
          },
          isAcquired: { $gt: [{ $size: "$userAcquisition" }, 0] }
        }
      },
      // Remove campos desnecessários
      { $project: { authorInfo: 0, userAcquisition: 0 } },
      // Ordena pelos mais recentes
      { $sort: { createdAt: -1 } }
    ])
    return res.status(200).json(tools)
  } catch (error) {
    console.error(`[READ_PUBLISHED_TOOLS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readPublished

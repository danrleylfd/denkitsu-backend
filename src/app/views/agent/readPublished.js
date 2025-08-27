const mongoose = require("mongoose")
const Agent = require("../../models/agent")

const readPublished = async (req, res) => {
  try {
    const { userID } = req

    const agents = await Agent.aggregate([
      // Para testes, vamos comentar a linha que esconde os seus próprios agentes
      {
        $match: {
          published: true
          // author: { $ne: new mongoose.Types.ObjectId(userID) }
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
      // Verifica se o usuário atual adquiriu este agente
      {
        $lookup: {
          from: "acquisitions",
          let: { agentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$item", "$$agentId"] },
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

    return res.status(200).json(agents)
  } catch (error) {
    console.error(`[READ_PUBLISHED_AGENTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readPublished

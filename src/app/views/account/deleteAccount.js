const User = require("../../models/auth")
const Linker = require("../../models/linker")
const Video = require("../../models/video")
const Comment = require("../../models/comment")
const Agent = require("../../models/agent")
const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")
const Like = require("../../models/like")
const Share = require("../../models/share")
const createAppError = require("../../../utils/errors")

const deleteAccount = async (req, res) => {
  const { user, userID } = req

  if (user.stripeSubscriptionId && user.subscriptionCancelAtPeriodEnd === false) throw createAppError("Você precisa cancelar sua assinatura antes de excluir a conta. Acesse a página de assinatura para agendar o cancelamento.", 403, "ACTIVE_SUBSCRIPTION_DELETE_FORBIDDEN")
  const agentIds = (await Agent.find({ author: userID }).select("_id")).map(a => a._id)
  const toolIds = (await Tool.find({ author: userID }).select("_id")).map(t => t._id)
  const itemsToPurgeFromAcquisitions = [...agentIds, ...toolIds]
  const videoIds = (await Video.find({ user: userID }).select("_id")).map(video => video._id)
  await Promise.all([
    Acquisition.deleteMany({ item: { $in: itemsToPurgeFromAcquisitions } }),
    Agent.deleteMany({ author: userID }),
    Tool.deleteMany({ author: userID }),
    Video.deleteMany({ user: userID }),
    Linker.deleteMany({ user: userID }),
    Acquisition.deleteMany({ user: userID }),
    Like.deleteMany({ user: userID }),
    Share.deleteMany({ user: userID }),
    Comment.deleteMany({ user: userID }),
    Comment.deleteMany({ video: { $in: videoIds } }),
    User.deleteOne({ _id: userID })
  ])
  return res.status(204).send()
}

module.exports = deleteAccount

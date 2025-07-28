const User = require("../../models/auth")
const Linker = require("../../models/linker")
const Video = require("../../models/video")
const Comment = require("../../models/comment")

const deleteAccount = async (req, res) => {
  try {
    const { userID } = req
    const videoIds = (await Video.find({ user: userID }).select("_id")).map(video => video._id)
    await Promise.all([
      Linker.deleteMany({ user: userID }),
      Comment.deleteMany({ video: { $in: videoIds } }),
      Video.deleteMany({ user: userID }),
      User.deleteOne({ _id: userID })
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_ACCOUNT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = deleteAccount

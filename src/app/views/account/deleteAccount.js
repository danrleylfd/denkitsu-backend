const User = require("../../models/auth")
const Linker = require("../../models/linker")
const Video = require("../../models/video")
const Comment = require("../../models/comment")
const Log = require("../../models/log")

const deleteAccount = async (req, res) => {
  try {
    const { userID } = req
    const videoIds = (await Video.find({ user: userID }).select("_id")).map(video => video._id)
    await Promise.all([
      Linker.deleteMany({ user: userID }),
      Comment.deleteMany({ video: { $in: videoIds } }),
      Video.deleteMany({ user: userID }),
      Log.deleteMany({ user: userID }),
      User.deleteOne({ _id: userID })
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_ACCOUNT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_ACCOUNT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {}
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = deleteAccount

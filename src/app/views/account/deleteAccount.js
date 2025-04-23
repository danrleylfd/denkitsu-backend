const User = require("../../models/auth")
const Linker = require("../../models/linker")
const Video = require("../../models/video")
const Comment = require("../../models/comment")
const Log = require("../../models/log")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const user = await User.findById(userID)
    const videos = await Video.find({ user: user._id }).select("_id")
    const videoIds = videos.map(video => video._id)
    await Promise.all([
      Linker.deleteMany({ user: user._id }),
      Comment.deleteMany({ video: { $in: videoIds } }),
      Video.deleteMany({ user: user._id }),
      Log.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id)
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

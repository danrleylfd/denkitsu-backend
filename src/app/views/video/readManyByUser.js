const Video = require("../../models/video")

const readManyByUser = async (req, res) => {
  try {
    const userID = req.params.userID || req.userID
    const videos = await Video.find({ user: userID }).sort("-createdAt").populate("user")
    return res.status(200).json(videos)
  } catch (error) {
    console.error(`[VIDEOS_BY_USER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readManyByUser

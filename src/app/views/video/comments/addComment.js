const Comment = require("../../../models/comment")
const Video = require("../../../models/video")

const addComment = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const { content } = req.body
    const video = await Video.findById(videoID)
    if (!video) throw new Error("VIDEO_NOT_FOUND")
    let comment = await Comment.create({
      content: content.trim(),
      user: userID,
      video: videoID
    })
    comment = await comment.populate("user")
    return res.status(201).json(comment)
  } catch (error) {
    console.error(`[POST_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = addComment

const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

const addComment = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const { content } = req.body
    const video = await Video.findById(videoID).select("comments")
    let comment = await Comment.create({
      content: content.trim(),
      user: userID,
      video: videoID
    })
    comment = await comment.populate("user")
    video.comments.push(comment._id)
    await video.save()
    return res.status(201).json(comment)
  } catch (error) {
    console.error(`[POST_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = addComment

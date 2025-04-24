const Video = require("../../../models/video")
const Comment = require("../../../models/comment")

const delComment = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID, comment: commentID } = req.params
    if (!commentID || commentID.length !== 24) throw new Error("INVALID_COMMENT")
    const deletedComment = await Comment.findOneAndDelete({  _id: commentID,  user: userID })
    if (!deletedComment) throw new Error("COMMENT_NOT_FOUND")
    await Promise.all([
      Comment.deleteMany({ parent: commentID }),
      Video.updateOne({ _id: videoID }, {  $pull: { comments: commentID } })
    ])
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_COMMENT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_COMMENT] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      INVALID_COMMENT: { status: 422, message: "comment invalid" },
      COMMENT_NOT_FOUND: { status: 404, message: "comment not found/exists or you are not the author of this comment" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = delComment

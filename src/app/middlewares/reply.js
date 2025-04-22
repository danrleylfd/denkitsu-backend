module.exports = (req, res, next) => {
  try {
    const { video: videoID, comment: commentID, reply: replyID } = req.params
    if (videoID.length < 24) throw new Error("VIDEO_MISSING")
    if (commentID.length < 24) throw new Error("COMMENT_MISSING")
    if (replyID.length < 24) throw new Error("REPLY_MISSING")
    next()
  } catch (error) {
    console.error(`[REPLY_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[REPLY_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video id missing." },
      COMMENT_MISSING: { status: 422, message: "comment id missing." },
      REPLY_MISSING: { status: 422, message: "reply id missing." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

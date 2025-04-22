module.exports = (req, res, next) => {
  try {
    const { comment: commentID, reply: replyID } = req.params
    if (!commentID || commentID.trim().length !== 24) throw new Error("COMMENT_MISSING")
    if (!replyID || replyID.trim().length !== 24) throw new Error("REPLY_MISSING")
    next()
  } catch (error) {
    console.error(`[REPLY_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[REPLY_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      COMMENT_MISSING: { status: 422, message: "comment is required." },
      REPLY_MISSING: { status: 422, message: "reply is required" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = (req, res, next) => {
  try {
    const { video: videoID } = req.params
    if (!videoID || videoID.length < 24) throw new Error("VIDEO_MISSING")
    req.params.video = req.params.video.trim()
    next()
  } catch (error) {
    console.error(`[COMMENT_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[COMMENT_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "Video ID is missing" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

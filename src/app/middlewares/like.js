module.exports = (req, res, next) => {
  try {
    const { video: videoID } = req.params
    if (!videoID || videoID.trim().length !== 24) throw new Error("VIDEO_MISSING")
    next()
  } catch (error) {
    console.error(`[LIKE_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[LIKE_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_MISSING: { status: 422, message: "video is required" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

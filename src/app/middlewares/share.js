module.exports = (req, res, next) => {
  try {
    let { video: videoID } = req.params
    if (videoID?.trim() || videoID.length !== 24) throw new Error("VIDEO_INVALID")
    next()
  } catch (error) {
    console.error(`[SHARE_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[SHARE_MIDDLEWARE] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      VIDEO_INVALID: { status: 422, message: "Video ID is missing or invalid" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

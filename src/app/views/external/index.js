const external = async (req, res) => {
  try {
    const data = {
      baseURL: "https://vidburner.com/wp-json/aio-dl/video-data",
      ContentType: "application/x-www-form-urlencoded",
      Token: "1967fc1a7f7fef915141c3b469d5f7f5df629e8b23aee8ca7c5afb2ae63aa04a"
    }
    return res.status(200).json({ data })
  } catch (error) {
    console.error(`[EXTERNAL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[EXTERNAL] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {}
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = external

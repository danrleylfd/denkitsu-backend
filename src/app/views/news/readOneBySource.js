const News = require("../../models/news")

const readOneBySource = async (req, res) => {
  try {
    const { source } = req.params
    const news = await News.findOne({ source: source.trim() })
    if (!news) throw new Error("NEWS_NOT_FOUND")
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[READ_ONE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_ONE_NEWS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      NEWS_NOT_FOUND: { status: 204, message: "news not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = readOneBySource

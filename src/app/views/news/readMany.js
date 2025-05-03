const News = require("../../models/news")

const readMany = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })
    if (!news) throw new Error("NEWS_NOT_FOUND")
    return res.status(200).json(news)
  } catch (error) {
    console.error(`[READ_MANY_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_MANY_NEWS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      NEWS_NOT_FOUND: { status: 404, message: "news not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = readMany

const News = require("../../models/news")

const readOneBySource = async (req, res) => {
  try {
    const { source } = req.params
    const news = await News.findOne({ source: decodeURIComponent(source.trim()) })
    if (!news) throw new Error("NEWS_NOT_FOUND")
    return res.status(200).json(news)
  } catch (error) {
    console.error(`[READ_ONE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      NEWS_NOT_FOUND: { status: 404, message: "Nenhuma notícia encontrada com esta fonte." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readOneBySource

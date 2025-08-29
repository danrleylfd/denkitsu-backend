const News = require("../../models/news")

const createAppError = require("../../../utils/errors")

const readOneBySource = async (req, res) => {
  const { source } = req.params
  const news = await News.findOne({ source: decodeURIComponent(source.trim()) })
  if (!news) throw createAppError("Nenhuma notícia encontrada com esta fonte.", 404, "NEWS_NOT_FOUND")
  return res.status(200).json(news)
}

module.exports = readOneBySource

const News = require("../../models/news")
const createAppError = require("../../../utils/errors")

const createOne = async (req, res) => {
  const { content, source } = req.body
  try {
    const news = await News.create({ content: content.trim(), source: source.trim() })
    return res.status(201).json(news)
  } catch (error) {
    if (error.code === 11000) throw createAppError("Uma notícia com esta fonte (source) já existe.", 409, "SOURCE_ALREADY_EXISTS")
    throw error
  }
}

module.exports = createOne

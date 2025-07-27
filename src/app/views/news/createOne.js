const News = require("../../models/news")

const createOne = async (req, res) => {
  try {
    const { content, source } = req.body
    const news = await News.create({ content: content.trim(), source: source.trim() })
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[CREATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao criar a notícia." }
    })
  }
}

module.exports = createOne

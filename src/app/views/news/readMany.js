const News = require("../../models/news")

const readMany = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })
    return res.status(200).json(news)
  } catch (error) {
    console.error(`[READ_MANY_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao buscar as notícias." }
    })
  }
}

module.exports = readMany

const News = require("../../models/news")

const readMany = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })
    return res.status(200).json(news)
  } catch (error) {
    console.error(`[READ_MANY_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readMany

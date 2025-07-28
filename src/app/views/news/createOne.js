const News = require("../../models/news")

const createOne = async (req, res) => {
  try {
    const { content, source } = req.body
    const news = await News.create({ content: content.trim(), source: source.trim() })
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[CREATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne

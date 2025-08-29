const News = require("../../models/news")

const readManyCursor = async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query
    const query = {}
    if (cursor) query._id = { $lt: cursor }
    const news = await News.find(query).sort({ _id: -1 }).limit(limit)
    const nextCursor = news.length === limit ? news[news.length - 1]._id : null
    return res.status(200).json({ news, nextCursor })
  } catch (error) {
    console.error(`[READ_MANY_CURSOR_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readManyCursor

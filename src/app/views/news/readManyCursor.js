const mongoose = require("mongoose")
const News = require("../../models/news")

const readManyCursor = async (req, res) => {
  const { cursor } = req.query
  const limit = parseInt(req.query.limit, 10) || 10
  const query = {}
  if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(`${cursor}`) }
  const news = await News.find(query).sort({ _id: -1 }).limit(limit).lean()
  const nextCursor = news.length === limit ? news[news.length - 1]._id : null
  return res.status(200).json({ news, nextCursor })
}

module.exports = readManyCursor

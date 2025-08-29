const News = require("../../models/news")

const readMany = async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 })
  return res.status(200).json(news)
}

module.exports = readMany

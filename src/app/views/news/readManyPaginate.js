const News = require("../../models/news")

const readManyPaginate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const news = await News.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (!news || news.length === 0) throw new Error("NEWS_NOT_FOUND");
    const total = await News.countDocuments()
    const totalPages = Math.ceil(total / limit)
    return res.status(200).json({
      news: news.docs,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error(`[READ_MANY_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_MANY_NEWS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      NEWS_NOT_FOUND: { status: 404, message: "News not found" },
    }
    const { status, message } = errorMessages[error.message] || defaultError;
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = readManyPaginate

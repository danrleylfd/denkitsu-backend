const News = require("../../models/news")

const readManyPaginate = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const result = await News.paginate({}, { page, limit, sort: { createdAt: -1 } })
    return res.status(200).json({
      news: result.docs,
      pagination: {
        totalItems: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        itemsPerPage: result.limit,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPrevPage
      }
    })
  } catch (error) {
    console.error(`[READ_MANY_PAGINATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readManyPaginate

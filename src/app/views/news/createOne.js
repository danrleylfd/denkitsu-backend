const News = require("../../models/news")

const createOne = async (req, res) => {
  try {
    const { content, source } = req.body
    console.log(`[CREATE_NEWS] ${source}`)
    if (!content?.trim()) throw new Error("CONTENT_MISSING")
    if (!source?.trim()) throw new Error("SOURCE_MISSING")
    const news = await News.create({ content: content.trim(), source: source.trim() })
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[CREATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[CREATE_NEWS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      CONTENT_MISSING: { status: 422, message: "content is required" },
      SOURCE_MISSING: { status: 422, message: "source is required" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = createOne

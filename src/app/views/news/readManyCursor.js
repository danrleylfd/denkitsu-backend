const mongoose = require("mongoose")
const News = require("../../models/news")

const readManyCursor = async (req, res) => {
  try {
    console.log("--- [NEWS CURSOR] Nova Requisição ---")

    const { cursor } = req.query
    const limit = parseInt(req.query.limit, 10) || 10

    console.log(`[NEWS CURSOR] Parâmetros recebidos: cursor=${cursor}, limit=${limit}`)

    const query = {}
    if (cursor) {
      console.log(`[NEWS CURSOR] Aplicando cursor: _id < ${cursor}`)
      query._id = { $lt: mongoose.Types.ObjectId(cursor) }
    } else {
      console.log("[NEWS CURSOR] Carga inicial, sem cursor.")
    }

    const news = await News.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean()

    console.log(`[NEWS CURSOR] Query ao banco de dados retornou ${news.length} documentos.`)

    const nextCursor = news.length === limit ? news[news.length - 1]._id : null

    console.log(`[NEWS CURSOR] Condição 'news.length === limit' (${news.length} === ${limit}) é: ${news.length === limit}`)
    console.log(`[NEWS CURSOR] 'nextCursor' gerado: ${nextCursor}`)
    console.log("--- [NEWS CURSOR] Fim da Requisição ---")

    return res.status(200).json({ news, nextCursor })
  } catch (error) {
    console.error(`[READ_MANY_CURSOR_NEWS] ERRO:`, error)
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readManyCursor

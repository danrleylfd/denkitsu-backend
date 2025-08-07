const { searchMedia } = require("../../../utils/api/tmdb")

const search = async (req, res) => {
  try {
    const { query } = req.query
    const { status, data } = await searchMedia(query)
    return res.status(status).json(data)
  } catch (error) {
    console.error(`[SEARCH_TMDB] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor ao buscar a mídia." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = search

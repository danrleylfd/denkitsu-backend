const { searchGames } = require("../../../utils/api/rawg")

const search = async (req, res) => {
  try {
    const { query } = req.query
    const { status, data } = await searchGames(query)
    return res.status(status).json(data)
  } catch (error) {
    console.error(`[SEARCH_GAMES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor ao buscar jogos." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = search

const { getMediaDetails } = require("../../../utils/api/tmdb")

const getDetails = async (req, res) => {
  try {
    const { type, id } = req.params
    const { status, data } = await getMediaDetails(type, id)
    return res.status(status).json(data)
  } catch (error) {
    console.error(`[GET_TMDB_DETAILS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor ao buscar detalhes da mídia." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = getDetails

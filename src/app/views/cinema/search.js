const { searchMedia } = require("../../../utils/api/tmdb")

const search = async (req, res) => {
  const { query } = req.query
  const { status, data } = await searchMedia(query)
  return res.status(status).json(data)
}

module.exports = search

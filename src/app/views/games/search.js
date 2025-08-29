const { searchGames } = require("../../../utils/api/rawg")

const search = async (req, res) => {
  const { query } = req.query
  const { status, data } = await searchGames(query)
  return res.status(status).json(data)
}

module.exports = search

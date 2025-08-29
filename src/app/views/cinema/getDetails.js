const { getMediaDetails } = require("../../../utils/api/tmdb")

const getDetails = async (req, res) => {
  const { type, id } = req.params
  const { status, data } = await getMediaDetails(type, id)
  return res.status(status).json(data)
}

module.exports = getDetails

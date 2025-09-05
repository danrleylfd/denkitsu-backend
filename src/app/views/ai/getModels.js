const { getModels } = require("../../../utils/api/ai")

const getModelsView = async (req, res) => {
  const { provider, customApiUrl, customApiKey } = req.query
  const models = await getModels(provider, customApiUrl, customApiKey)
  return res.status(200).json({ models })
}

module.exports = getModelsView

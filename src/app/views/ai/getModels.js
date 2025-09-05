const { getModels } = require("../../../utils/api/ai")

const getModelsView = async (req, res) => {
  const { aiProvider, customApiUrl, customApiKey } = req.query
  const models = await getModels(aiProvider, customApiUrl, customApiKey)
  return res.status(200).json({ models })
}

module.exports = getModelsView

const { getModels: listModels } = require("../../../utils/api/ai")

const getModels = async (req, res) => {
  const models = await listModels()
  return res.status(200).json({ models })
}

module.exports = getModels

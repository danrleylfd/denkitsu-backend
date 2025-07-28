const { getModels: listModels } = require("../../../utils/api/ai")

const getModels = async (req, res) => {
  try {
    const models = await listModels()
    return res.status(200).json({ models })
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data)
    console.error(`[GET_MODELS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = getModels

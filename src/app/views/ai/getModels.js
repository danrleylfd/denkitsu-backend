const { getModels: listModels } = require("../../../utils/api/ai")

const getModels = async (req, res) => {
  try {
    const models = await listModels()
    return res.status(200).json({ models })
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data)
    console.error(`[GET_MODELS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[GET_MODELS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {}
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = getModels

const prompt = require("../../../utils/prompts")

const getPrompt = async (req, res) => {
  try {
    return res.status(200).json(prompt)
  } catch (error) {
    console.error(`[READ_PROMPT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_PROMPT] ${new Date().toISOString()} - Internal server error` }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = getPrompt

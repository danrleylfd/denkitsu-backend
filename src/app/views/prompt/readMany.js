const Prompt = require("../../models/prompt")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const prompts = await Prompt.find({ user: userID }).sort("-createdAt")
    return res.status(200).json(prompts)
  } catch (error) {
    console.error(`[READ_PROMPTS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    return res.status(defaultError.status).json({ error: { code: error.message, message: defaultError.message } })
  }
}

module.exports = readMany

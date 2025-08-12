const Prompt = require("../../models/prompt")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const { title, content } = req.body
    const prompt = await Prompt.create({ title, content, user: userID })
    return res.status(201).json(prompt)
  } catch (error) {
    console.error(`[CREATE_PROMPT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    return res.status(defaultError.status).json({ error: { code: error.message, message: defaultError.message } })
  }
}

module.exports = createOne

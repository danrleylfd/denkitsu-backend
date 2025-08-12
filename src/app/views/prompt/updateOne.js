const Prompt = require("../../models/prompt")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { promptId } = req.params
    const { title, content } = req.body

    const prompt = await Prompt.findOneAndUpdate(
      { _id: promptId, user: userID },
      { title, content },
      { new: true }
    )

    if (!prompt) {
      return res.status(404).json({ error: { code: "PROMPT_NOT_FOUND", message: "Prompt não encontrado ou você не tem permissão para editá-lo." } })
    }

    return res.status(200).json(prompt)
  } catch (error) {
    console.error(`[UPDATE_PROMPT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    return res.status(defaultError.status).json({ error: { code: error.message, message: defaultError.message } })
  }
}

module.exports = updateOne

const Prompt = require("../../models/prompt")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { promptId } = req.params

    const prompt = await Prompt.findOneAndDelete({ _id: promptId, user: userID })

    if (!prompt) {
      return res.status(404).json({ error: { code: "PROMPT_NOT_FOUND", message: "Prompt не encontrado ou você não tem permissão para excluí-lo." } })
    }

    return res.status(204).send()
  } catch (error) {
    console.error(`[DELETE_PROMPT] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    return res.status(defaultError.status).json({ error: { code: error.message, message: defaultError.message } })
  }
}

module.exports = deleteOne

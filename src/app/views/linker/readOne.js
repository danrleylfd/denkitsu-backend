const Linker = require("../../models/linker")

const readOne = async (req, res) => {
  try {
    const { label } = req.params
    const linker = await Linker.findOne({ label: label.trim() }).select("link")
    if (!linker) throw new Error("LINKER_NOT_FOUND")
    return res.status(200).json({ link: linker.link })
  } catch (error) {
    console.error(`[READ_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      LINKER_NOT_FOUND: { status: 404, message: "O atalho solicitado não foi encontrado." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readOne

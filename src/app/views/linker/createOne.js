const Linker = require("../../models/linker")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const { label, link } = req.body
    const linker = await Linker.create({
      user: userID,
      label: label.trim(),
      link: link.trim()
    })
    return res.status(201).json(linker)
  } catch (error) {
    console.error(`[CREATE_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "LABEL_ALREADY_EXISTS", message: "Este rótulo (label) já está em uso." }
      })
    }
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne

const Linker = require("../../models/linker")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const linkers = await Linker.find({ user: userID }).sort("-createdAt")
    return res.status(200).json(linkers)
  } catch (error) {
    console.error(`[READ_MANY_LINKERS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = readMany

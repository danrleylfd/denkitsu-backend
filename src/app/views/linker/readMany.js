const Linker = require("../../models/linker")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const linkers = await Linker.find({ user: userID }).sort("-createdAt")
    return res.status(200).json(linkers)
  } catch (error) {
    console.error(`[READ_MANY_LINKERS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao buscar os atalhos." }
    })
  }
}

module.exports = readMany

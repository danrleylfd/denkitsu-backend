const Acquisition = require("../../models/acquisition")

const unacquireOne = async (req, res) => {
  try {
    const { userID } = req
    const { toolId } = req.params

    await Acquisition.deleteOne({ user: userID, item: toolId })

    return res.status(200).json({ message: "Ferramenta removida da sua coleção." })
  } catch (error) {
    console.error(`[UNACQUIRE_TOOL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = unacquireOne

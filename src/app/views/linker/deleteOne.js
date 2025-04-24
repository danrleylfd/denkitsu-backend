const Linker = require("../../models/linker")

const deleteOne = async (req, res) => {
  try {
    const { userID } = req
    const { label } = req.params
    if (!label?.trim()) throw new Error("LABEL_MISSING")
    const deletedLinker = await Linker.deleteOne({ label: label.trim(), user: userID })
    if (!deletedLinker || deletedLinker.deletedCount < 1) throw new Error("LINKER_NOT_FOUND")
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LABEL_MISSING: { status: 422, message: "label is required" },
      LINKER_NOT_FOUND: { status: 404, message: "linker not found/exists or you are not the owner" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = deleteOne

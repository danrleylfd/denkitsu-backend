const Linker = require("../../models/linker")

const readOne = async (req, res) => {
  try {
    const { label } = req.params
    if (!label || label.trim().length === 0) throw new Error("LABEL_MISSING")
    const linker = await Linker.findOne({ label }).populate("user").exec()
    if (!linker) throw new Error("LINKER_NOT_FOUND")
    return res.status(200).json({ link: linker.link })
  } catch (error) {
    console.error(`[READ_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LABEL_MISSING: { status: 422, message: "label is required" },
      LINKER_NOT_FOUND: { status: 404, message: "linker not found/exists within this label" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = readOne

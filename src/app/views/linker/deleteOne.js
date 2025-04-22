const User = require("../../models/auth")
const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { label } = req.params
    if (!label?.trim()) throw new Error("LABEL_MISSING")
    const user = await User.findById(userID)
    let linker = await Linker.findOne({ label })
    if (!linker) throw new Error("LINKER_NOT_FOUND")
    if (linker.user.toString() !== userID) throw new Error("UNAUTHORIZED")
    await Linker.deleteOne({ label })
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LABEL_MISSING: { status: 422, message: "label is required" },
      LINKER_NOT_FOUND: { status: 404, message: "linker not found/exists within this label" },
      UNAUTHORIZED: { status: 401, message: "you are not the owner of this label" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

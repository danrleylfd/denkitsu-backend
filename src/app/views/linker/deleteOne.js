const User = require("../../models/auth")
const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { label } = req.params
    if (!label?.trim()) throw new Error("LABEL_MISSING")
    const user = await User.findById(userID)
    if (!user) throw new Error("USER_NOT_FOUND")
    let linker = await Linker.findOne({ label })
    if (!linker) throw new Error("LABEL_NOT_FOUND")
    if (linker.user.toString() !== userID) throw new Error("UNAUTHORIZED")
    await Linker.deleteOne({ label })
    return res.status(204).send()
  } catch (error) {
    console.error(`[DEL_LABEL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[DEL_LABEL] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LABEL_MISSING: { status: 422, message: "label is required" },
      USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
      LABEL_NOT_FOUND: { status: 404, message: "label not found/exists" },
      UNAUTHORIZED: { status: 401, message: "you are not the owner of this label" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

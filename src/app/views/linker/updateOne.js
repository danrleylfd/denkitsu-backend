const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { oldLabel } = req.params
    const { newLabel, newLink } = req.body
    if (!oldLabel?.trim()) throw new Error("OLD_LABEL_MISSING")
    if (!newLabel?.trim()) throw new Error("NEW_LABEL_MISSING")
    if (!newLink?.trim()) throw new Error("NEW_LINK_MISSING")
    const linker = await Linker.findOne({ label: oldLabel, user: userID })
    if (!linker) throw new Error("LABEL_NOT_FOUND")
    linker.label = newLabel
    linker.link = newLink
    await linker.save()
    return res.status(201).json(linker)
  } catch (error) {
    console.error(`[UPDATE_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[UPDATE_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      OLD_LABEL_MISSING: { status: 422, message: "old label is required" },
      NEW_LABEL_MISSING: { status: 422, message: "new label is required" },
      NEW_LINK_MISSING: { status: 422, message: "new link is required" },
      LABEL_NOT_FOUND: { status: 404, message: "label not found/exists" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

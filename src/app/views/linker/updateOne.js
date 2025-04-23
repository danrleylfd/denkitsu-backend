const Linker = require("../../models/linker")

const updateOne = async (req, res) => {
  try {
    const { userID } = req
    const { oldLabel } = req.params
    const { newLabel, newLink } = req.body
    if (!oldLabel?.trim()) throw new Error("OLD_LABEL_MISSING")
    if (!newLabel?.trim()) throw new Error("NEW_LABEL_MISSING")
    if (!newLink?.trim()) throw new Error("NEW_LINK_MISSING")
    const linker = await Linker.findOne({ label: oldLabel, user: userID })
    if (!linker) throw new Error("LINKER_NOT_FOUND")
    linker.label = newLabel
    linker.link = newLink
    await linker.save()
    return res.status(201).json(linker)
  } catch (error) {
    console.error(`[UPDATE_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[UPDATE_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      OLD_LABEL_MISSING: { status: 422, message: "oldLabel is required" },
      NEW_LABEL_MISSING: { status: 422, message: "newLabel is required" },
      NEW_LINK_MISSING: { status: 422, message: "newLink is required" },
      LINKER_NOT_FOUND: { status: 404, message: "linker not found/exists within this label and user" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, error: message })
  }
}

module.exports = updateOne

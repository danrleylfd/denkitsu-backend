const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { label, link } = req.body
    if (!label?.trim()) throw new Error("LABEL_MISSING")
    if (!link?.trim()) throw new Error("LINK_MISSING")
    const _linker = await Linker.findOne({ label })
    if (_linker) throw new Error("LABEL_ALREADY_EXISTS")
    const linker = await Linker.create({
      user: userID,
      label: label.trim(),
      link: link.trim()
    })
    return res.status(201).json(linker)
  } catch (error) {
    console.error(`[CREATE_LINKER] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[CREATE_LINKER] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LABEL_MISSING: { status: 422, message: "label is required" },
      LINK_MISSING: { status: 422, message: "link is required" },
      LABEL_ALREADY_EXISTS: { status: 409, message: "label already exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

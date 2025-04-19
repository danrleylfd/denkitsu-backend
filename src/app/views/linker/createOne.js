const mongoose = require("../../../utils/database")
const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { id: userID } = req.query
    const { label, link } = req.body
    const user = new mongoose.Types.ObjectId(userID)
    if (!label || label.trim().length === 0)
      return res.status(422).json({ error: "label missing" })
    if (!link || link.trim().length === 0) return res.status(422).json({ error: "link missing" })
    const _linker = await Linker.findOne({ label })
    if (_linker) return res.status(401).json({ error: "Label already exists" })
    const linker = await Linker.create({
      user,
      label: label.trim(),
      link: link.trim()
    })
    return res.status(201).json(linker)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

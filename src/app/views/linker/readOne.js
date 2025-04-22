const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { label } = req.params
    if (!label || label.trim().length === 0) return res.status(422).json({ error: "label is required" })
    const linker = await Linker.findOne({ label }).populate("user").exec()
    if (!linker) return res.status(404).json({ error: "label not found/exists" })
    return res.status(200).json({ link: linker.link })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

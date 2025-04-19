const User = require("../../models/auth")
const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { id } = req
    const { label } = req.params
    if (!label || label.length === 0) return res.status(422).json({ error: "label missing" })
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: "User not found/exist" })
    let linker = await Linker.findOne({ label })
    if (!linker) return res.status(404).json({ error: "Label not found" })
    if (linker.user.toString() !== id)
      return res.status(401).json({ error: "You are not the owner of this label" })
    await Linker.deleteOne({ label })
    return res.status(204).json({ message: "Successfully deleted" })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

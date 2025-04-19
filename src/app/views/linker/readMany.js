const mongoose = require("../../../utils/database")
const User = require("../../models/auth")
const Linker = require("../../models/linker")

module.exports = async (req, res) => {
  try {
    const { id } = req
    console.log(`Id do usuário: ${id}`)
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: "User not found/exist" })
    const linkers = await Linker.find({ user: user._id }).sort("-createdAt").populate("user").exec()
    if (!linkers || linkers.length === 0) return res.status(404).json({ error: "No labels found" })
    return res.status(200).json(linkers)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

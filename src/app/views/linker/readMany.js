const Linker = require("../../models/linker")

const readMany = async (req, res) => {
  const { user } = req
  const linkers = await Linker.find({ user: user._id }).sort("-createdAt")
  return res.status(200).json(linkers)
}

module.exports = readMany

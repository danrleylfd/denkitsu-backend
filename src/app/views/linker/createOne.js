const Linker = require("../../models/linker")

const createAppError = require("../../../utils/errors")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const { label, link } = req.body
    const linker = await Linker.create({
      user: userID,
      label: label.trim(),
      link: link.trim()
    })
    return res.status(201).json(linker)
  } catch (error) {
    if (error.code === 11000) throw createAppError("Este rótulo (label) já está em uso.", 409, "LABEL_ALREADY_EXISTS")
    throw error
  }
}

module.exports = createOne

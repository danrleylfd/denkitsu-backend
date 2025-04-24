const User = require("../../models/auth")
const Linker = require("../../models/linker")

const readMany = async (req, res) => {
  try {
    const { userID } = req
    const linkers = await Linker.find({ user: userID }).sort("-createdAt")
    if (!linkers?.length === 0) throw new Error("LINKERS_NOT_FOUND")
    return res.status(200).json(linkers)
  } catch (error) {
    console.error(`[READ_MANY_LINKERS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_MANY_LINKERS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LINKERS_NOT_FOUND: { status: 404, message: "linkers not found/exists within this user" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = readMany

const Log = require("../../models/log")

module.exports = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).populate("user", "_id name email")
    if (!logs) throw new Error("LOGS_NOT_FOUND")
    return res.status(200).json(logs)
  } catch (error) {
    console.error(`[READ_LOGS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[READ_LOGS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      LOGS_NOT_FOUND: { status: 404, message: "logs not found/exists" },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

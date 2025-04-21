const Log = require("../../models/log")

module.exports = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).populate("user", "_id name email")
    return res.status(200).json(logs)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

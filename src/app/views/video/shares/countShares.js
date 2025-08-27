const Share = require("../../../models/share")

const countShares = async (req, res) => {
  try {
    const { video: videoID } = req.params
    const sharesCount = await Share.countDocuments({ video: videoID })
    return res.status(200).json({ shares: sharesCount })
  } catch (error) {
    console.error(`[COUNT_SHARES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = countShares

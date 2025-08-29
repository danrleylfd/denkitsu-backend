const Share = require("../../../models/share")

const countShares = async (req, res) => {
  const { video: videoID } = req.params
  const sharesCount = await Share.countDocuments({ video: videoID })
  return res.status(200).json({ shares: sharesCount })
}

module.exports = countShares

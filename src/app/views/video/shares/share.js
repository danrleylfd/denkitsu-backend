const Share = require("../../../models/share")

const registerShare = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  await Share.create({ user: userID, video: videoID })
  return res.status(201).send()
}

module.exports = registerShare

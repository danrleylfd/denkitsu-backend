const Like = require("../../../models/like")

const addLike = async (req, res) => {
  const { userID } = req
  const { video: videoID } = req.params
  await Like.findOneAndUpdate(
    { user: userID, video: videoID },
    { $set: { user: userID, video: videoID } },
    { upsert: true }
  )
  return res.status(201).send()
}

module.exports = addLike

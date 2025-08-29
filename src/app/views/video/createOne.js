const Video = require("../../models/video")

const createOne = async (req, res) => {
  const { userID } = req
  const { content, thumbnail, fileUrl } = req.body
  const video = await Video.create({
    user: userID,
    content: content.trim(),
    thumbnail: thumbnail.trim(),
    fileUrl: fileUrl.trim()
  })
  const populatedVideo = await video.populate("user")
  return res.status(201).json(populatedVideo)
}

module.exports = createOne

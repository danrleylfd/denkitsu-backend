const Video = require("../../../models/video")

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).populate("user")
    // Retorna se o usuário não houver curtido o video:
    if (!video.likes.includes(userID))
      return res.status(422).json({ error: "You didn't like this video" })
    // Descurte o video:
    await Video.updateOne({ _id: videoID }, { $pull: { likes: userID } }, { new: true })
    const updatedVideo = await Video.findById(videoID).populate("user")
    return res.status(200).json(updatedVideo)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

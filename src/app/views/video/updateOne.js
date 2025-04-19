const Video = require("../../models/video")

const isEmpty = (value) => !value || value.trim().length === 0

module.exports = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const { key, newValue } = req.body
    // Retorna se o usuário não houver enviado os params/body do video:
    if ([key, newValue].some(isEmpty))
      return res.status(422).json({
        message:
          "one or more of the variables is missing: videoID, key and newValue.",
        note: "key is any attribute of a video."
      })
    let video = await Video.findOne({ _id: videoID, user: userID })
    video[key] = newValue
    await video.save()
    // video = await Video.findById(videoID)
    return res.status(201).json(video)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

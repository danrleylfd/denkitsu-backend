const Video = require("../../../models/video")

const registerShare = async (req, res) => {
  try {
    const { userID } = req
    const { video: videoID } = req.params
    const video = await Video.findById(videoID).select("shares sharesExtras")
    if (!video.shares.includes(userID)) video.shares.push(userID)
    else video.sharesExtras += 1
    await video.save()
    return res.status(201).send()
  } catch (error) {
    console.error(`[SHARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro inesperado ao registrar o compartilhamento." }
    })
  }
}

module.exports = registerShare

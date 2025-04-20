const Video = require("../../models/video")

const isEmpty = (value) => !value || value.trim().length === 0

module.exports = async (req, res) => {
  try {
    const { userID } = req.query
    const { content, coverUrl, fileUrl } = req.body
    // Retorna se o usuário não houver enviado o body do video:
    if ([content, coverUrl, fileUrl].some(isEmpty))
      return res.status(422).json({
        message: "one or more of the variables is missing: content, coverUrl and fileUrl."
      })
    const video = await Video.findOneOrCreate({
      user: userID,
      content: content.trim(),
      coverUrl: coverUrl.trim(),
      fileUrl: fileUrl.trim()
    })
    return res.status(201).json(video)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

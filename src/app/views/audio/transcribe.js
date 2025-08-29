const { toFile } = require("openai/uploads")
const OpenAI = require("openai")

const createAppError = require("../../../utils/errors")

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_API_URL,
})

const transcribeAudio = async (req, res) => {
  if (!req.file) throw createAppError("Nenhum arquivo de áudio foi enviado.", 400, "NO_AUDIO_FILE")
  const file = await toFile(req.file.buffer, req.file.originalname)
  const transcription = await groq.audio.transcriptions.create({ file: file, model: "whisper-large-v3" })
  return res.status(200).json({ transcription: transcription.text })
}

module.exports = transcribeAudio

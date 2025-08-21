const { toFile } = require("openai/uploads")
const OpenAI = require("openai")

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_API_URL,
})

const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) throw new Error("NO_AUDIO_FILE")
    const file = await toFile(req.file.buffer, req.file.originalname)
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
    })
    return res.status(200).json({ transcription: transcription.text })
  } catch (error) {
    console.error(`[TRANSCRIBE_AUDIO] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      NO_AUDIO_FILE: { status: 400, message: "Nenhum arquivo de áudio foi enviado." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = transcribeAudio

const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_API_URL
})

const textToSpeech = async (model = "playai-tts", response_format = "wav", text, voice = "Mason-PlayAI") => {
  try {
    console.log(`[TOOL_CALL] Convertendo texto em áudio com a voz: ${voice}`)
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format
    })
    console.log(response)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const audioBase64 = buffer.toString('base64')
    return {
      status: 200,
      data: {
        audio: audioBase64,
        format: response_format,
        voice: voice
      }
    }
  } catch (error) {
    console.error(`[TTS_SERVICE] Erro ao converter texto em áudio:`, error.message, text)
    throw new Error("TOOL_ERROR")
  }
}

const ttsTool = {
  type: "function",
  function: {
    name: "ttsTool",
    description: "Converte texto em áudio usando a API de Text-to-Speech da Groq. Retorna o áudio em formato base64.",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "O modelo TTS a ser usado. Padrão: 'playai-tts'",
          enum: ["playai-tts", "playai-tts-arabic"]
        },
        response_format: {
          type: "string",
          description: "O formato do áudio. Atualmente apenas 'wav' é suportado.",
          enum: ["wav"]
        },
        text: {
          type: "string",
          description: "O texto a ser convertido em áudio. Máximo de 10.000 caracteres."
        },
        voice: {
          type: "string",
          description: "A voz a ser usada. Padrão: 'Fritz-PlayAI'",
          enum: [
            "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI",
            "Calum-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI",
            "Cillian-PlayAI", "Deedee-PlayAI", "Fritz-PlayAI", "Gail-PlayAI",
            "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI", "Mikail-PlayAI",
            "Mitch-PlayAI", "Quinn-PlayAI", "Thunder-PlayAI", "Ahmad-PlayAI",
            "Amira-PlayAI", "Khalid-PlayAI", "Nasser-PlayAI"
          ]
        }
      },
      required: ["text"]
    }
  }
}

module.exports = { textToSpeech, ttsTool }

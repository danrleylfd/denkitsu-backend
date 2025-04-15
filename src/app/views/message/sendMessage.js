const ask = require("../../../utils/services/ai")

const sysPrompt = {
  role: "system",
  content:
    "O assistant deve sempre responder em pt-BR, mesmo que o usuário escreva em outro idioma."
}

module.exports = async (req, res) => {
  try {
    const { model, prompts } = req.body
    if (!model || !prompts) return res.status(400).json({ error: "Bad Request" })
    console.log(`MODEL ${model}`)
    console.log(`USER ${prompts[0].content}`)
    const { status, data } = await ask([sysPrompt, ...prompts], { model })
    console.log(`ASSISTANT ${data.choices[0].message.content.split("\n")[0]}...`)
    return res.status(status).json(data)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

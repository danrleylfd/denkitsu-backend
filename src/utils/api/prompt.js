const prompts = require("../prompts")

const getPromptByName = async (nomeDoAgente) => {
  console.log(`[TOOL_CALL] Buscando prompt pelo nome do agente: ${nomeDoAgente}`)
  const normalizedAgentName = nomeDoAgente.toLowerCase().trim()
  const prompt = prompts.find(p => {
    if (!p.content) return false
    const firstLine = p.content.trim().split("\n")[0]
    const agentNameInPrompt = firstLine.replace(/^Agente\s/i, "").toLowerCase().trim()
    return agentNameInPrompt === normalizedAgentName
  })
  if (!prompt) {
    return {
      status: 404,
      data: { message: `O Agente "${nomeDoAgente}" não foi encontrado.` }
    }
  }
  const index = prompts.indexOf(prompt)
  const agente = prompt.content.trim().split("\n")[0]
  return {
    status: 200,
    data: {
      codigo: String(index + 1).padStart(3, "0"),
      agente,
      content: prompt.content
    }
  }
}

const promptTool = {
  type: "function",
  function: {
    name: "promptTool",
    description: "Use esta ferramenta para verificar o conteúdo de um prompt de sistema da IA usando o nome do Agente. Retorna o conteúdo completo do prompt associado ao nome.",
    parameters: {
      type: "object",
      properties: {
        nomeDoAgente: {
          type: "string",
          description: "O nome do agente do prompt a ser verificado."
        }
      },
      required: ["nomeDoAgente"]
    }
  }
}

module.exports = { getPromptByName, promptTool }

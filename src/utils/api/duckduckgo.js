const axios = require("axios")

const searchDuckDuckGo = async (query) => {
  try {
    console.log(`[TOOL_CALL] Buscando no DuckDuckGo por: ${query}`)
    const { data } = await axios.get("https://api.duckduckgo.com/", {
      params: {
        q: query,
        format: "json",
        no_html: 1,
        skip_disambig: 1
      }
    })
    const formatResponse = (responseData) => {
      const summary = responseData.AbstractText || "Nenhum resumo direto encontrado."
      const source = {
        name: responseData.AbstractSource || "N/A",
        url: responseData.AbstractURL || "N/A"
      }
      const results = (responseData.RelatedTopics || [])
        .filter(item => item.Text && item.FirstURL)
        .map(item => ({
          title: item.Text,
          url: item.FirstURL
        }))
        .slice(0, 5)
      return { summary, source, results }
    }
    const formattedData = formatResponse(data)
    return { status: 200, data: formattedData }
  } catch (error) {
    console.error(`[DUCKDUCKGO_SERVICE] Erro ao buscar por "${query}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const duckduckgoTool = {
  type: "function",
  function: {
    name: "duckduckgoTool",
    description: "Use essa tool para fazer uma pesquisa no buscador Duckduckgo. Sua resposta DEVE ser uma lista numerada de resultados no formato `1. [Título do Site](URL)`. Após apresentar a lista, você DEVE perguntar ao usuário: 'Qual destes resultados você gostaria que eu acessasse para obter mais detalhes?'.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A sua pergunta ou termo de pesquisa. Seja o mais específico possível. Exemplo: 'últimos avanços em computação quântica' ou 'qual a altura do Monte Roraima?'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchDuckDuckGo, duckduckgoTool }

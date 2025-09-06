const axios = require("axios")
const createAppError = require("../../errors")

const searchWikipedia = async ({ query }) => {
  try {
    const encodedTopic = encodeURIComponent(query.replace(/ /g, "_"))
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodedTopic}`
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "DenkitsuAI/1.0 (https://denkitsu.vercel.app/chat)" }
    })
    const summary = {
      title: data.title,
      summary: data.extract,
      url: data.content_urls.desktop.page
    }
    return { status: 200, data: summary }
  } catch (error) {
    console.error(`[WIKIPEDIA_SERVICE] Erro ao buscar o tópico "${query}":`, error.response?.data || error.message)
    throw createAppError("Não foi possível conectar ao serviço da Wikipedia ou o tópico não foi encontrado.", 503, "WIKIPEDIA_API_ERROR")
  }
}

const wikiTool = {
  type: "function",
  function: {
    name: "wikiTool",
    description:
      "Use essa tool para buscar um resumo sobre um tópico, conceito, pessoa ou lugar na Wikipedia. Use para perguntas que buscam definições ou conhecimento geral, como 'O que é um buraco negro?' ou 'Quem foi Santos Dumont?'.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "O tópico ou termo a ser pesquisado. Por exemplo: 'Inteligência artificial'."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchWikipedia, wikiTool }

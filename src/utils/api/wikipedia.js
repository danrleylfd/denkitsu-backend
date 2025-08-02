const axios = require("axios")

const searchWikipedia = async (topic) => {
  try {
    const encodedTopic = encodeURIComponent(topic.replace(/ /g, "_"))
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
    console.error(`[WIKIPEDIA_SERVICE] Erro ao buscar o tópico "${topic}":`, error.response?.data || error.message)
    return {
        status: 404,
        data: { error: "Tópico não encontrado na Wikipedia." }
    }
  }
}

const wikipediaTool = {
  type: "function",
  function: {
    name: "wikipediaTool",
    description:
      "Busca um resumo sobre um tópico, conceito, pessoa ou lugar na Wikipedia. Use para perguntas que buscam definições ou conhecimento geral, como 'O que é um buraco negro?' ou 'Quem foi Santos Dumont?'.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "O tópico ou termo a ser pesquisado. Por exemplo: 'Inteligência artificial'."
        }
      },
      required: ["topic"]
    }
  }
}

module.exports = { searchWikipedia, wikipediaTool }

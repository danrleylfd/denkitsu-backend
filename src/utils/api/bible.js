const axios = require("axios")

const formatQuery = (query) => {
  return query
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "+")
}

const searchBible = async (query, translation = "almeida") => {
  try {
    const formattedQuery = formatQuery(query)
    console.log(`[TOOL_CALL] Buscando na Bíblia por: ${formattedQuery} (Tradução: ${translation})`)

    const { data } = await axios.get(`https://bible-api.com/${formattedQuery}`, {
      params: { translation },
    })

    if (!data || !data.verses) {
      return {
        status: 404,
        data: { message: `Não foi possível encontrar a referência "${query}". Verifique se o livro, capítulo e versículo estão corretos.` },
      }
    }

    const formattedResponse = {
      reference: data.reference,
      translation: data.translation_name,
      text: data.text.trim(),
    }

    return { status: 200, data: formattedResponse }
  } catch (error) {
    console.error(`[BIBLE_SERVICE] Erro ao buscar por "${query}":`, error.response?.data || error.message)
    if (error.response?.status === 404) {
      return {
        status: 404,
        data: { message: `A referência "${query}" não foi encontrada. Verifique o nome do livro, capítulo e versículo.` },
      }
    }
    throw new Error("TOOL_ERROR")
  }
}

const bibleTool = {
  type: "function",
  function: {
    name: "bibleTool",
    description: "Use esta ferramenta para buscar e ler versículos ou capítulos da Bíblia. Especifique o livro, capítulo e, opcionalmente, o versículo. Você também pode solicitar uma tradução específica. Retorne para o usuário em formato > citação.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A referência bíblica a ser pesquisada. Formatos aceitos: 'Livro Capítulo:Versículo', 'Livro Capítulo:VersículoInicial-VersículoFinal', 'Livro Capítulo'. Exemplo: 'João 3:16' ou 'Gênesis 1'.",
        },
        translation: {
          type: "string",
          description: "Opcional. A tradução da Bíblia a ser usada. O padrão é 'almeida' (português). Outras opções incluem 'kjv' (King James Version).",
          "enum": ["almeida", "kjv", "bbe", "web"],
        },
      },
      required: ["query"],
    },
  },
}

module.exports = { searchBible, bibleTool }

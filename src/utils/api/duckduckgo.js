const axios = require("axios")
const cheerio = require("cheerio")

const searchDuckDuckGo = async (query) => {
  try {
    console.log(`[TOOL_CALL] Buscando no DuckDuckGo (HTML) por: ${query}`)
    const apiRequest = axios.get("https://api.duckduckgo.com/", {
      params: { q: query, format: "json", no_html: 1, skip_disambig: 1 }
    })
    const htmlRequest = axios.get("https://html.duckduckgo.com/html/", {
      params: { q: query },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
      }
    })
    const [apiResponse, { data: html }] = await axios.all([apiRequest, htmlRequest])
    const summary_try_1 = apiResponse.data?.AbstractText || null
    const $ = cheerio.load(html)
    let summary_try_2 = null
    const summaryNode = $("#zero_click_abstract")
    if (summaryNode.length > 0) {
      const summaryClone = summaryNode.clone()
      summaryClone.find("a[href*='wikipedia.org']").parent().remove()
      summary_try_2 = summaryClone.text().trim()
    }
    const results = []
    $(".result").each((i, element) => {
      const titleElement = $(element).find(".result__a")
      const descriptionElement = $(element).find(".result__snippet")
      const url = titleElement.attr("href")
      const title = titleElement.text().trim()
      const description = descriptionElement.text().trim()
      if (title && url) {
        results.push({ title, url, description })
      }
    })
    if (results.length === 0 && summary_try_1 && !summary_try_2) {
      return {
        status: 404,
        data: { message: "Nenhum resultado encontrado para a busca." }
      }
    }
    const finalData = { summary_try_1, summary_try_2, results: results.slice(0, 10) }
    console.log(finalData)
    return { status: 200, data: finalData }
  } catch (error) {
    console.error(`[DUCKDUCKGO_SERVICE] Erro ao buscar por "${query}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const duckduckgoPrompt = `
Agente Duckduckgo
  Goal
    Use essa tool para fazer uma pesquisa no buscador Duckduckgo
  User Input (Template)
    /duckduckgo "Search Term"
  Return Format (Template)
    > summary...
    1. [title](url)
      description
    2. [title](url)
      description
    ...
    10. [title](url)
      description
    **Quer que eu acesse algum desses sites?**
  Warning
    Esse Agente é ativado sempre que o assistente usar duckduckgoTool
    Proibido usar rótulos: Nunca inclua os termos "summary", "title", "url" ou "description" na sua resposta
    Sem formatação extra: Não use tabelas, ou qualquer outra formatação que não seja a lista numerada em Markdown descrita acima
    Consistência: A resposta deve se assemelhar a uma página de resultados de um motor de busca, não a uma conversa de assistente
    Chamada para Ação: Ao final da lista, sempre termine com a pergunta: "**Quer que eu acesse algum desses sites?**"
  Context Dump
    Termo de busca fornecido pelo usuário
`

const duckduckgoTool = {
  type: "function",
  function: {
    name: "duckduckgoTool",
    description: duckduckgoPrompt, // "Use essa tool para fazer uma pesquisa no buscador Duckduckgo. Se um resumo direto (summary) for retornado, apresente-o primeiro. Sua resposta DEVE ser semelhante a um resultado de busca de um buscador, uma lista numerada(Não tabela) de resultados no formato markdown `1. [Título do resultado 1](URL do resultado 1)\nDescrição do resultado 1...`. Após apresentar a lista, você DEVE perguntar ao usuário: 'Qual destes resultados você gostaria que eu acessasse para obter mais detalhes?'.",
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

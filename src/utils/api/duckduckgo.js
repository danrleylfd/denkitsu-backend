const axios = require("axios")
const cheerio = require("cheerio")

const searchDuckDuckGo = async (query) => {
  try {
    console.log(`[TOOL_CALL] Buscando no DuckDuckGo (HTML) por: ${query}`)
    const { data: html } = await axios.get("https://html.duckduckgo.com/html/", {
      params: { q: query },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
      }
    })
    const $ = cheerio.load(html)
    let summary = null
    const summaryNode = $("#zero_click_abstract")
    if (summaryNode.length > 0) {
      const summaryClone = summaryNode.clone()
      summaryClone.find("a[href*='wikipedia.org']").parent().remove()
      summary = summaryClone.text().trim()
    }
    const results = []
    $(".result").each((i, element) => {
      const titleElement = $(element).find(".result__a")
      const url = titleElement.attr("href")
      const title = titleElement.text().trim()
      if (title && url) {
        results.push({ title, url })
      }
    })
    if (results.length === 0 && !summary) {
      return {
        status: 404,
        data: { message: "Nenhum resultado encontrado para a busca." }
      }
    }
    const finalData = { summary, results: results.slice(0, 10) }
    return { status: 200, data: finalData }
  } catch (error) {
    console.error(`[DUCKDUCKGO_SERVICE] Erro ao buscar por "${query}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const duckduckgoTool = {
  type: "function",
  function: {
    name: "duckduckgoTool",
    description: "Use essa tool para fazer uma pesquisa geral na web. Se um resumo direto (summary) for retornado, apresente-o primeiro. Em seguida, SEMPRE apresente uma lista numerada de resultados no formato `1. [Título do Site](URL)`. Após a lista, você DEVE perguntar ao usuário: 'Qual destes resultados você gostaria que eu acessasse para obter mais detalhes?'.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A sua pergunta ou termo de pesquisa. Seja o mais específico possível."
        }
      },
      required: ["query"]
    }
  }
}

module.exports = { searchDuckDuckGo, duckduckgoTool }

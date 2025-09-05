const axios = require("axios")
const cheerio = require("cheerio")

const browseUrl = async ({ url }) => {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
    })
    const $ = cheerio.load(html)
    $("script, style, nav, footer, header, aside, form").remove()
    let mainContent = $("main").text() || $("article").text() || $("body").text()
    const cleanedText = mainContent.replace(/\s\s+/g, ' ').trim()
    const limitedText = cleanedText.substring(0, 15000)
    if (!limitedText) {
      throw new Error("Não foi possível extrair conteúdo de texto da página.")
    }
    return {
      status: 200,
      data: {
        source: url,
        content: limitedText,
      },
    }
  } catch (error) {
    console.error(`[BROWSER_SERVICE] Erro ao navegar na URL "${url}":`, error.message)
    throw new Error("TOOL_ERROR")
  }
}

const browserTool = {
  type: "function",
  function: {
    name: "browserTool",
    description: "Use essa tool para acessar e ler o conteúdo de uma URL específica fornecida pelo usuário. Use esta ferramenta quando o usuário fornecer um link e pedir para acessar, resumir, analisar, ou extrair informações daquela página.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "A URL completa da página da web a ser acessada.",
        },
      },
      required: ["url"],
    },
  },
}

module.exports = { browseUrl, browserTool }

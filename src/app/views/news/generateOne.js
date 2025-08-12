const News = require("../../models/news")
const { searchNews } = require("../../../utils/api/news")
const { ask } = require("../../../utils/api/ai")
const prompts = require("../../../utils/prompts")

const cleanAiOutput = (text = "") => {
  const cleanedText = text.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, "")
  return cleanedText
    .replaceAll("Título Chamativo/Impactante Com Palavras-Chave Para SEO","")
    .replaceAll("Título: ","")
    .replaceAll("Título","")
    .replaceAll("Subtítulo: ","").replaceAll("Subtítulo:","")
    .replaceAll("Subtítulo 1: ","").replaceAll("Subtítulo 1:","")
    .replaceAll("Subtítulo 2: ","").replaceAll("Subtítulo 2:","")
    .replaceAll("Subtítulo 3: ","").replaceAll("Subtítulo 3:","")
    .replaceAll("Subtítulo de conclusão: ","").replaceAll("Subtítulo de conclusão - ","").replaceAll("Subtítulo de conclusão","")
    .replaceAll("Conclusão: ","").replaceAll("Conclusão: ","").replaceAll("Conclusão e ","").replaceAll("Conclusão","")
    .replaceAll("\n** ","\n**")
    .replaceAll(" **","**")
    .replaceAll("****","")
    .replaceAll("**:** ","")
    .trim()
}

const generateOne = async (req, res) => {
  try {
    const { aiProvider = "groq", aiKey, searchTerm = "" } = req.body
    const { data: newsData } = await searchNews(searchTerm)
    if (!newsData || newsData.articles.length === 0) throw new Error("NEWS_NOT_FOUND")
    const article = newsData.articles[0]
    const articleExists = await News.findOne({ source: article?.url })
    if (articleExists) throw new Error("ARTICLE_EXISTS")
    const userPrompt = {
      role: "user",
      content: `Modo Redator Tema:\n\n### ${article.title}\n\n![${article.title}](${article.urlToImage})\n\n${article.description}\n\n${article.content}\n\n**Fonte(s):** [${article.source.name}](${article.url})`
    }
    const { data: aiData } = await ask(aiProvider, aiKey, [prompts[8], userPrompt])
    if (!aiData || !aiData.choices || aiData.choices.length === 0) throw new Error("AI_ERROR")
    const cleanContent = cleanAiOutput(aiData.choices[0].message.content)
    const news = await News.create({ content: cleanContent, source: article.url, })
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[GENERATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      ARTICLE_EXISTS: { status: 409, message: "Esta notícia já foi gerada e publicada." },
      NEWS_NOT_FOUND: { status: 404, message: "Nenhuma notícia encontrada para o termo pesquisado." },
      AI_ERROR: { status: 503, message: "O serviço de IA não conseguiu processar a notícia no momento." },
      TOOL_ERROR: { status: 500, message: "Falha ao buscar notícias." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = generateOne

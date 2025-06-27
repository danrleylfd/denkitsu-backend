const News = require("../../models/news")
const newsService = require("../../../utils/services/news")
const ask = require("../../../utils/services/ai")
const prompt = require("../../../utils/prompts")

const cleanAiOutput = (text = "") => {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
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
    const { llm = "groq", searchTerm = "" } = req.body
    const { data: newsData } = await newsService(searchTerm)
    if(!newsData) throw new Error("NEWS_NOT_FOUND")
    const article = newsData.articles[0]
    const articleExists = await News.findOne({ source: article?.url })
    if (articleExists) throw new Error("ARTICLE_EXISTS")
    const userPrompt = {
      role: "user",
      content: `Modo Redator Tema:\n\n### ${article.title}\n\n![${article.title}](${article.urlToImage})\n\n${article.description}\n\n${article.content}\n\n**Fonte(s):** [${article.source.name}](${article.url})`
    }
    const { data: aiData } = await ask(llm, [prompt,userPrompt], { model: "deepseek/deepseek-r1:free" })
    if(!aiData || !aiData.choices || aiData.choices.length === 0) throw new Error("AI_ERROR")
    const cleanContent = cleanAiOutput(aiData.choices[0].message.content)
    const news = await News.create({
      content: cleanContent,
      source: article.url,
    })
    return res.status(201).json(news)
  } catch (error) {
    console.error(`[CREATE_NEWS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[CREATE_NEWS] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      ARTICLE_EXISTS: { status: 409, message: "article already exists" },
      NEWS_NOT_FOUND: { status: 404, message: "news not found" },
      AI_ERROR: { status: 500, message: `[CREATE_NEWS] ${new Date().toISOString()} - AI error` },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = generateOne

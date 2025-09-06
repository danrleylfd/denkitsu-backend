const News = require("../../models/news")
const { searchNews } = require("../../../utils/tools/search/news")
const { ask } = require("../../../utils/api/ai")
const prompts = require("../../../utils/prompts")

const createAppError = require("../../../utils/errors")

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
  const { aiProvider = "groq", aiKey, searchTerm = "" } = req.body
  const { data: newsData } = await searchNews({ searchTerm })
  if (!newsData || newsData.articles.length === 0) throw createAppError("Nenhuma notícia encontrada para o termo pesquisado.", 404, "NEWS_NOT_FOUND")
  const article = newsData.articles[0]
  const articleExists = await News.findOne({ source: article?.url })
  if (articleExists) throw createAppError("Esta notícia já foi gerada e publicada.", 409, "ARTICLE_EXISTS")
  const userPrompt = {
    role: "user",
    content: `Agente Redator Tema:\n\n### ${article.title}\n\n![${article.title}](${article.urlToImage})\n\n${article.description}\n\n${article.content}\n\n**Fonte(s):** [${article.source.name}](${article.url})`
  }
  const { data: aiData } = await ask(aiProvider, aiKey, [prompts[6], userPrompt])
  if (!aiData || !aiData.choices || aiData.choices.length === 0) throw createAppError("O serviço de IA não conseguiu processar a notícia no momento.", 503, "AI_ERROR")
  const cleanContent = cleanAiOutput(aiData.choices[0].message.content)
  const news = await News.create({ content: cleanContent, source: article.url })
  return res.status(201).json(news)
}

module.exports = generateOne

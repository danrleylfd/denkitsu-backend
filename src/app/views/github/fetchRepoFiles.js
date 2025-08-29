const axios = require("axios")

const createAppError = require("../../../utils/errors")

const isBinaryContent = (content) => /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)

const fetchRepoFiles = async (req, res) => {
  const { repo: repoName } = req.query
  const { user } = req
  if (!user.githubAccessToken) throw createAppError("Usuário não autenticado com o GitHub ou token não encontrado.", 403, "GITHUB_AUTH_FAILED")
  const headers = { Authorization: `Bearer ${user.githubAccessToken}` }
  const [owner, repo] = repoName.split("/")
  const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers })
  const tree = treeResponse.data.tree
  const filePromises = tree
    .filter(item => item.type === "blob")
    .map(async item => {
      try {
        const fileResponse = await axios.get(item.url, { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } })
        const content = fileResponse.data
        if (typeof content === "string" && !isBinaryContent(content)) return { path: item.path, content }
        return null
      } catch (e) {
        console.warn(`Falha ao baixar ${item.path}, ignorando.`)
        return null
      }
    })
  const files = (await Promise.all(filePromises)).filter(Boolean)
  res.status(200).json({ projectName: repoName, files: files })
}

module.exports = fetchRepoFiles

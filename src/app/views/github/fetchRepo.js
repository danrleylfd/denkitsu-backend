const axios = require("axios")
const User = require("../../models/auth")

// Funções auxiliares (podem ser movidas para um arquivo de utils se preferir)
const isBinaryContent = (content) => /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)
const processContent = (content) => content.replace(/(\r\n|\n|\r){3,}/g, "$1$1").trim()
const generateFileTree = (filePaths, rootName) => {
  const tree = {}
  filePaths.forEach((path) => {
    let level = tree
    path.split("/").forEach((part) => {
      if (!part) return
      if (!level[part]) level[part] = {}
      level = level[part]
    })
  })
  const buildTreeString = (dir, prefix = "") => {
    const entries = Object.keys(dir).sort()
    let result = ""
    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1
      const connector = isLast ? "└── " : "├── "
      result += `${prefix}${connector}${entry}\n`
      if (Object.keys(dir[entry]).length > 0) {
        const newPrefix = prefix + (isLast ? "    " : "│   ")
        result += buildTreeString(dir[entry], newPrefix)
      }
    })
    return result
  }
  return `${rootName}/\n${buildTreeString(tree)}`
}

const fetchRepo = async (req, res) => {
  const { repo: repoName } = req.query
  const { userID } = req

  if (!repoName) {
    return res.status(400).json({ error: "Nome do repositório é obrigatório." })
  }

  try {
    const user = await User.findById(userID).select("+githubAccessToken")
    if (!user || !user.githubAccessToken) {
      return res.status(403).json({ error: "Usuário não autenticado com o GitHub ou token não encontrado." })
    }

    const headers = { Authorization: `Bearer ${user.githubAccessToken}` }
    const [owner, repo] = repoName.split("/")

    // 1. Buscar a árvore de arquivos
    const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers })
    const tree = treeResponse.data.tree

    // 2. Buscar o conteúdo de cada arquivo
    const filePromises = tree
      .filter(item => item.type === "blob")
      .map(async item => {
        try {
          const fileResponse = await axios.get(item.url, { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } })
          const content = fileResponse.data
          if (typeof content === 'string' && !isBinaryContent(content)) {
            return { path: item.path, content }
          }
          return null
        } catch (e) { return null }
      })

    const files = (await Promise.all(filePromises)).filter(Boolean)

    // 3. Montar a string do codebase
    const fileTree = generateFileTree(files.map(f => f.path), repoName)
    const outputParts = [
      `PROJETO: ${repoName}`, "---",
      `ESTRUTURA DE FICHEIROS:\n${fileTree}`, "---",
      "CONTEÚDO DOS FICHEIROS:", "---",
      ...files.map(({ path, content }) => `---[ ${path} ]---\n${processContent(content)}`)
    ]
    const codebaseString = outputParts.join("\n\n")

    res.setHeader('Content-Type', 'text/plain')
    res.status(200).send(codebaseString)

  } catch (error) {
    console.error("[FETCH_REPO_ERROR]", error.message)
    res.status(500).json({ error: "Falha ao buscar o conteúdo do repositório." })
  }
}

module.exports = fetchRepo

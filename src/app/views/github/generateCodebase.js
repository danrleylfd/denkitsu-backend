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

const generateCodebase = (req, res) => {
  const { projectName, selectedFiles } = req.body

  if (!projectName || !selectedFiles || !Array.isArray(selectedFiles)) {
    return res.status(400).json({ error: "Dados inválidos para gerar o codebase." })
  }

  try {
    const fileTree = generateFileTree(selectedFiles.map(f => f.path), projectName)
    const outputParts = [
      `PROJETO: ${projectName}`, "---",
      `ESTRUTURA DE FICHEIROS:\n${fileTree}\n---`,
      "CONTEÚDO DOS FICHEIROS:", "---",
      ...selectedFiles.map(({ path, content }) => `---[ ${path} ]---\n${processContent(content)}`)
    ]
    const codebaseString = outputParts.join("\n\n")

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(codebaseString)
  } catch (error) {
    console.error("[GENERATE_CODEBASE_ERROR]", { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = generateCodebase

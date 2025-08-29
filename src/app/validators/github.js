const { query } = require("express-validator")

const fetchRepoRules = () => {
  return [
    query("repo")
      .trim()
      .notEmpty()
      .withMessage("O nome do repositório é obrigatório (formato: owner/repo).")
      .matches(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/)
      .withMessage("Formato de repositório inválido. Use o formato: owner/repo.")
  ]
}

module.exports = {
  fetchRepoRules
}

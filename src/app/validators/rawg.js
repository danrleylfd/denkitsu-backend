const { query } = require("express-validator")

const searchRules = () => {
  return [
    query("query")
      .trim()
      .notEmpty()
      .withMessage("O parâmetro 'query' da busca não pode estar vazio."),
  ]
}

module.exports = { searchRules }

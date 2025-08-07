const { query, param } = require("express-validator")

const searchRules = () => {
  return [
    query("query")
      .trim()
      .notEmpty()
      .withMessage("O parâmetro 'query' da busca não pode estar vazio.")
      .escape()
  ]
}

const detailsRules = () => {
  return [
    param("type")
      .isIn(["movie", "tv"])
      .withMessage("O tipo de mídia deve ser 'movie' ou 'tv'."),
    param("id")
      .isNumeric()
      .withMessage("O ID da mídia deve ser um número.")
  ]
}

module.exports = { searchRules, detailsRules }

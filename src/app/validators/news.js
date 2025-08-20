const { body, param, query } = require("express-validator")

const createNewsRules = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("O conteúdo da notícia é obrigatório.")
      .escape(),
    body("source")
      .trim()
      .notEmpty()
      .withMessage("A fonte da notícia é obrigatória.")
      .isURL()
      .withMessage("A fonte deve ser uma URL válida.")
      .escape(),
  ]
}

const generateNewsRules = () => {
  return [
    body("searchTerm")
      .optional()
      .trim()
      .escape(),
    body("aiProvider")
      .optional()
      .isIn(["openrouter", "groq"])
      .withMessage("O provedor de IA selecionado é inválido.")
      .escape(),
  ]
}

const paginateRules = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("A página deve ser um número inteiro positivo.")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("O limite deve ser um número inteiro entre 1 e 10.")
      .toInt(),
  ]
}

const sourceInParamsRules = () => {
  return [
    param("source")
      .notEmpty()
      .withMessage("A fonte é obrigatória na URL.")
      .escape(),
  ]
}

module.exports = {
  createNewsRules,
  generateNewsRules,
  paginateRules,
  sourceInParamsRules,
}

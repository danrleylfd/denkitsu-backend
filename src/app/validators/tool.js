const { body, param } = require("express-validator")

const createToolRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("O nome da ferramenta é obrigatório.")
      .isLength({ max: 50 })
      .withMessage("O nome não pode ter mais de 50 caracteres.")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("O nome só pode conter letras, números, _ e -."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("A descrição da ferramenta é obrigatória."),
    body("alias")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("O apelido não pode ter mais de 50 caracteres."),
    body("parameters")
      .optional()
      .isObject()
      .withMessage("O esquema de parâmetros deve ser um objeto JSON válido."),
    body("httpConfig.method")
      .isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .withMessage("Método HTTP inválido."),
    body("httpConfig.url")
      .trim()
      .notEmpty()
      .withMessage("A URL da API é obrigatória.")
      .isURL()
      .withMessage("A URL fornecida é inválida."),
    body("httpConfig.headers")
      .optional()
      .isObject()
      .withMessage("Os cabeçalhos devem ser um objeto JSON válido."),
    body("httpConfig.body")
      .optional()
      .isObject()
      .withMessage("O corpo da requisição deve ser um objeto JSON válido."),
  ]
}

const updateToolRules = () => {
  return [
    param("toolId")
      .isMongoId()
      .withMessage("O ID da ferramenta na URL é inválido."),
    ...createToolRules(),
  ]
}

const toolIdInParams = () => {
  return [
    param("toolId")
      .isMongoId()
      .withMessage("O ID da ferramenta na URL é inválido."),
  ]
}

module.exports = {
  createToolRules,
  updateToolRules,
  toolIdInParams,
}

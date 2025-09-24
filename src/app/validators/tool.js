const { body, param } = require("express-validator")

const createToolRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("O nome da ferramenta é obrigatório.")
      .isLength({ max: 32 })
      .withMessage("O nome não pode ter mais de 32 caracteres.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("O nome só pode conter letras, números e _."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("A descrição da ferramenta é obrigatória.")
      .isLength({ max: 512 })
      .withMessage("A descrição não pode ter mais de 512 caracteres."),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 32 })
      .withMessage("O apelido não pode ter mais de 32 caracteres.")
      .escape(),
    body("Icon")
      .trim()
      .notEmpty()
      .withMessage("O ícone da ferramenta é obrigatório.")
      .isLength({ max: 32 })
      .withMessage("O ícone não pode ter mais de 32 caracteres.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("O ícone só pode conter letras e números."),
    body("published")
      .optional()
      .isBoolean()
      .withMessage("O campo 'published' deve ser um valor booleano."),
    body("httpConfig.method")
      .isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .withMessage("Método HTTP inválido."),
    body("httpConfig.url")
      .trim()
      .notEmpty()
      .withMessage("A URL da API é obrigatória.")
      .isURL()
      .withMessage("A URL fornecida é inválida."),
    body("responseMapping")
      .optional()
      .isString()
      .withMessage("O mapeamento da resposta deve ser um texto.")
      .trim(),
    body("parameters")
      .optional()
      .isObject()
      .withMessage("O esquema de parâmetros deve ser um objeto JSON válido."),
    body("httpConfig.queryParams")
      .optional()
      .isObject()
      .withMessage("Os parâmetros de query devem ser um objeto JSON válido."),
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

const acquireToolIdInParams = () => {
  return [
    param("toolId")
      .isMongoId()
      .withMessage("O ID da ferramenta na URL é inválido.")
  ]
}

module.exports = {
  createToolRules,
  updateToolRules,
  toolIdInParams,
  acquireToolIdInParams,
}

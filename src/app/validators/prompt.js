const { body, param } = require("express-validator")

const promptRules = () => {
  return [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("O título deve ter no mínimo 3 caracteres."),
    body("content")
      .trim()
      .isLength({ min: 10 })
      .withMessage("O conteúdo do prompt deve ter no mínimo 10 caracteres.")
  ]
}

const promptIdRules = () => {
  return [
    param("promptId")
      .isMongoId()
      .withMessage("O ID do prompt fornecido na URL é inválido.")
  ]
}

module.exports = {
  promptRules,
  promptIdRules
}

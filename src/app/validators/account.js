const { body, param } = require("express-validator")

const editAccountRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isLength({ max: 16 })
      .withMessage("O nome não pode ter mais de 16 caracteres.")
      .escape(),
    body("avatarUrl")
      .optional()
      .trim()
      .isLength({ max: 256 })
      .withMessage("A URL do avatar não pode ter mais de 256 caracteres.")
      .isURL()
      .withMessage("A URL do avatar deve ser um endereço válido.")
      .escape(),
  ]
}

const getUserRules = () => {
  return [
    param("userID")
      .optional()
      .isMongoId()
      .withMessage("O ID de usuário fornecido na URL é inválido.")
      .escape()
  ]
}

module.exports = {
  editAccountRules,
  getUserRules,
}

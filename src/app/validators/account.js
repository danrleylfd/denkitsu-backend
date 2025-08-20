const { body, param } = require("express-validator")

const editAccountRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isLength({ max: 32 })
      .withMessage("O nome não pode ter mais de 32 caracteres.")
      .escape(),
    body("avatarUrl")
      .optional()
      .trim()
      .isLength({ max: 256 })
      .withMessage("A URL do avatar não pode ter mais de 256 caracteres.")
      .isURL()
      .withMessage("A URL do avatar deve ser um endereço válido."),
  ]
}

const getUserRules = () => {
    return [
      param("userID")
        .optional()
        .isMongoId()
        .withMessage("O ID de usuário fornecido na URL é inválido."),
    ]
}

module.exports = {
  editAccountRules,
  getUserRules,
}

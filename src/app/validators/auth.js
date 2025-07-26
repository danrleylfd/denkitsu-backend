const { body } = require("express-validator")

const signUpRules = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("O nome é obrigatório."),
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("A senha deve ter no mínimo 8 caracteres."),
  ]
}

const signInRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido."),
    body("password")
      .notEmpty()
      .withMessage("A senha é obrigatória."),
  ]
}

const forgotPasswordRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido."),
  ]
}

const resetPasswordRules = () => {
  return [
    body("token")
      .notEmpty()
      .withMessage("O token é obrigatório."),
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("A nova senha deve ter no mínimo 8 caracteres."),
  ]
}

module.exports = {
  signUpRules,
  signInRules,
  forgotPasswordRules,
  resetPasswordRules,
}

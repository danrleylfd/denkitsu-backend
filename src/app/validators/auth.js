const { body } = require("express-validator")

const signUpRules = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("O nome é obrigatório.")
      .escape(),
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido.")
      .escape(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("A senha deve ter no mínimo 8 caracteres.")
      .escape(),
  ]
}

const signInRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido.")
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("A senha é obrigatória.")
      .escape(),
  ]
}

const forgotPasswordRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido.")
      .escape(),
  ]
}

const resetPasswordRules = () => {
  return [
    body("token")
      .notEmpty()
      .withMessage("O token é obrigatório.")
      .escape(),
    body("email")
      .isEmail()
      .withMessage("O e-mail fornecido é inválido.")
      .escape(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("A nova senha deve ter no mínimo 8 caracteres.")
      .escape(),
  ]
}

const refreshTokenRules = () => {
  return [
    body("refreshToken")
      .notEmpty()
      .withMessage("O refresh token é obrigatório.")
      .matches(/^Bearer\s.+$/)
      .withMessage("O refresh token está mal formatado. O formato esperado é 'Bearer <token>'.")
      .escape(),
  ]
}

module.exports = {
  signUpRules,
  signInRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
}

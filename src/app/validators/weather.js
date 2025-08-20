const { param } = require("express-validator")

const locationRules = () => {
  return [
    param("location")
      .isLength({ min: 3 })
      .withMessage("O local precisa ter no mínimo 3 caracteres."),
  ]
}

const coordinatesRules = () => {
  return [
    param("lat")
      .notEmpty()
      .withMessage("A latitude é obrigatória.")
      .isFloat()
      .withMessage("A latitude deve ser um número."),
    param("lon")
      .notEmpty()
      .withMessage("A longitude é obrigatória.")
      .isFloat()
      .withMessage("A longitude deve ser um número."),
  ]
}

module.exports = {
  locationRules,
  coordinatesRules,
}

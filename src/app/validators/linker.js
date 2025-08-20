const { body, param } = require("express-validator")

const createLinkerRules = () => {
  return [
    body("label")
      .trim()
      .notEmpty()
      .withMessage("O rótulo (label) é obrigatório.")
      .escape(),
    body("link")
      .trim()
      .notEmpty()
      .withMessage("O link de destino é obrigatório.")
      .isURL()
      .withMessage("O link de destino deve ser uma URL válida.")
      .escape(),
  ]
}

const updateLinkerRules = () => {
  return [
    param("oldLabel")
      .notEmpty()
      .withMessage("O rótulo antigo é obrigatório na URL.")
      .escape(),
    body("newLabel")
      .trim()
      .notEmpty()
      .withMessage("O novo rótulo é obrigatório.")
      .escape(),
    body("newLink")
      .trim()
      .notEmpty()
      .withMessage("O novo link de destino é obrigatório.")
      .isURL()
      .withMessage("O novo link de destino deve ser uma URL válida.")
      .escape(),
  ]
}

const deleteLinkerRules = () => {
  return [
    param("label")
      .notEmpty()
      .withMessage("O rótulo (label) é obrigatório na URL.")
      .escape(),
  ]
}

const readOneRules = () => {
  return [
    param("label")
      .trim()
      .notEmpty()
      .withMessage("O 'label' (rótulo) do atalho é obrigatório na URL.")
      .escape(),
  ]
}

module.exports = {
  createLinkerRules,
  updateLinkerRules,
  deleteLinkerRules,
  readOneRules,
}

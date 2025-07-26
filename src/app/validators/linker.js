const { param } = require("express-validator")

const readOneRules = () => {
  return [
    param("label")
      .trim()
      .notEmpty().withMessage("O 'label' (rótulo) do atalho é obrigatório na URL.")
      .escape(),
  ]
}

module.exports = {
  readOneRules,
}

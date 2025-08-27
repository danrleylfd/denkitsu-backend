const { body, param } = require("express-validator")

const agentIdInParams = () => {
  return [
    param("agentId")
      .isMongoId()
      .withMessage("O ID do agente na URL é inválido."),
  ]
}

const createOrUpdateAgentRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("O nome do agente é obrigatório.")
      .isLength({ max: 32 })
      .withMessage("O nome não pode ter mais de 32 caracteres.")
      .escape(),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("A descrição do agente é obrigatória.")
      .isLength({ max: 256 })
      .withMessage("A descrição não pode ter mais de 256 caracteres.")
      .escape(),
    body("Icon")
      .trim()
      .notEmpty()
      .withMessage("O ícone do agente é obrigatório.")
      .isLength({ max: 32 })
      .withMessage("O ícone não pode ter mais de 32 caracteres.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("O ícone só pode conter letras e números."),
    body("published")
      .optional()
      .isBoolean()
      .withMessage("O campo 'published' deve ser um valor booleano."),
    body("prompt.goal")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Goal' do prompt é obrigatório.")
      .isLength({ max: 512 })
      .withMessage("O campo 'Goal' não pode ter mais de 512 caracteres."),
    body("prompt.returnFormat")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Return Format' do prompt é obrigatório.")
      .isLength({ max: 512 })
      .withMessage("O campo 'Return Format' não pode ter mais de 512 caracteres."),
    body("prompt.warning")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Warning' do prompt é obrigatório.")
      .isLength({ max: 512 })
      .withMessage("O campo 'Warning' não pode ter mais de 512 caracteres."),
    body("prompt.contextDump")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Context Dump' do prompt é obrigatório.")
      .isLength({ max: 512 })
      .withMessage("O campo 'Context Dump' não pode ter mais de 512 caracteres."),
  ]
}

module.exports = {
  agentIdInParams,
  createOrUpdateAgentRules,
}

const { body, param } = require("express-validator")

const agentIdInParams = () => {
  return [
    param("agentId")
      .isMongoId()
      .withMessage("O ID do agente na URL é inválido.")
      .escape(),
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
    body("icon")
      .trim()
      .notEmpty()
      .withMessage("O ícone do agente é obrigatório.")
      .escape(),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("A descrição do agente é obrigatória.")
      .isLength({ max: 128 })
      .withMessage("A descrição não pode ter mais de 128 caracteres."),
    body("prompt.goal")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Goal' do prompt é obrigatório."),
    body("prompt.returnFormat")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Return Format' do prompt é obrigatório."),
    body("prompt.warning")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Warning' do prompt é obrigatório."),
    body("prompt.contextDump")
      .trim()
      .notEmpty()
      .withMessage("O campo 'Context Dump' do prompt é obrigatório."),
  ]
}

module.exports = {
  agentIdInParams,
  createOrUpdateAgentRules,
}

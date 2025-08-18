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
      .isLength({ max: 30 })
      .withMessage("O nome não pode ter mais de 30 caracteres."),
    body("icon")
      .trim()
      .notEmpty()
      .withMessage("O ícone do agente é obrigatório."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("A descrição do agente é obrigatória.")
      .isLength({ max: 100 })
      .withMessage("A descrição não pode ter mais de 100 caracteres."),
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

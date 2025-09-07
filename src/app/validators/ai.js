const { body } = require("express-validator")

const sendMessageRules = () => {
  return [
    body("model")
      .trim()
      .notEmpty()
      .withMessage("É necessário selecionar um modelo de IA."),
    body("messages")
      .isArray({ min: 1 })
      .withMessage("É necessário enviar ao menos uma mensagem."),
    body("aiProvider")
      .optional()
      .isIn(["openrouter", "groq", "custom"])
      .withMessage("O provedor de IA selecionado é inválido."),
  ]
}

module.exports = {
  sendMessageRules,
}

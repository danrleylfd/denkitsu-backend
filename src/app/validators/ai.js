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
      .isIn(["openrouter", "groq"])
      .withMessage("O provedor de IA selecionado é inválido."),
    body("stream").custom((streamValue, { req }) => {
      if (!req.body) return true
      console.log(req.body)
      const use_tools = req.body.use_tools
      if (streamValue === true && use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
        throw new Error("O modo de streaming não pode ser usado em conjunto com ferramentas (tools).")
      }
      return true
    })
  ]
}

module.exports = {
  sendMessageRules,
}

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
    // body("stream").custom((streamValue, { req }) => {
    //   if (!req.body) return console.error("req.body é undefined, Danrley o problema é que a requisição está vindo sem Content-Type: application/json")
    //   const use_tools = req.body.use_tools
    //   if (streamValue === true && use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
    //     throw new Error("O modo de streaming não pode ser usado em conjunto com ferramentas (tools).")
    //   }
    //   return true
    // }),
  ]
}

module.exports = {
  sendMessageRules,
}

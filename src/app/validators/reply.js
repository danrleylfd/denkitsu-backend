const { body, param } = require("express-validator")

const commentIdInParams = () => {
  return [
    param("comment")
      .isMongoId()
      .withMessage("O ID do comentário na URL é inválido.")
  ]
}

const contentInBody = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("O conteúdo da resposta não pode estar vazio.")
  ]
}

const createReplyRules = () => {
  return [
    ...commentIdInParams(),
    ...contentInBody()
  ]
}

module.exports = {
  createReplyRules,
  listRepliesRules: commentIdInParams,
}

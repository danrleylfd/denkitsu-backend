const { body, param } = require("express-validator")

const videoIdInParams = () => {
  return [
    param("video")
      .notEmpty()
      .withMessage("O ID do vídeo é obrigatório na URL.")
      .isMongoId()
      .withMessage("O ID do vídeo na URL é inválido.")
      .escape(),
  ]
}

const commentIdInParams = () => {
  return [
    param("comment")
      .notEmpty()
      .withMessage("O ID do comentário é obrigatório na URL.")
      .isMongoId()
      .withMessage("O ID do comentário na URL é inválido.")
      .escape(),
  ]
}

const contentInBody = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("O conteúdo do comentário não pode estar vazio.")
      .escape(),
  ]
}

const addCommentRules = () => {
  return [
    ...videoIdInParams(),
    ...contentInBody()
  ]
}

const deleteCommentRules = () => {
  return [
    ...videoIdInParams(),
    ...commentIdInParams()
  ]
}

module.exports = {
  videoIdInParams,
  commentIdInParams,
  addCommentRules,
  deleteCommentRules
}

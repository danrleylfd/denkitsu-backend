const { body, param } = require("express-validator")

const videoIdInParams = () => {
  return [
    param("video")
      .isMongoId()
      .withMessage("O ID do vídeo fornecido na URL é inválido.")
  ]
}

const userIdInParams = () => {
  return [
    param("userID")
      .isMongoId()
      .withMessage("O ID de usuário fornecido na URL é inválido.")
  ]
}

const createVideoRules = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("O conteúdo (título) do vídeo é obrigatório."),
    body("thumbnail")
      .trim()
      .notEmpty()
      .withMessage("A URL da thumbnail é obrigatória.")
      .isURL()
      .withMessage("A thumbnail deve ser uma URL válida."),
    body("fileUrl")
      .trim()
      .notEmpty()
      .withMessage("A URL do arquivo de vídeo é obrigatória.")
      .isURL()
      .withMessage("A URL do arquivo de vídeo deve ser uma URL válida."),
  ]
}

const updateVideoRules = () => {
  return [
    ...videoIdInParams(),
    ...createVideoRules()
  ]
}

module.exports = {
  createVideoRules,
  updateVideoRules,
  deleteVideoRules: videoIdInParams,
  readOneVideoRules: videoIdInParams,
  readUserVideosRules: userIdInParams,
}

const { param } = require("express-validator")

const videoIdInParams = () => {
  return [
    param("video")
      .isMongoId()
      .withMessage("O ID do vídeo fornecido na URL é inválido."),
  ]
}

module.exports = {
  videoIdInParams,
}

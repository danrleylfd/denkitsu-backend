const createAppError = require("../../../utils/errors")

const handleGeminiStream = async (req, res, next) => {
  return next(createAppError("O provedor Gemini (com stream) ainda não foi implementado.", 501, "NOT_IMPLEMENTED"))
}

module.exports = handleGeminiStream

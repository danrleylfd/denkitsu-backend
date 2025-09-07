const createAppError = require("../../../utils/errors")

const handleGeminiNonStream = async (req, res, next) => {
  return next(createAppError("O provedor Gemini (sem stream) ainda não foi implementado.", 501, "NOT_IMPLEMENTED"))
}

module.exports = handleGeminiNonStream

const Comment = require("../models/comment")

const commentMiddleware = async (req, res, next) => {
  try {
    const { comment: commentID } = req.params
    const comment = await Comment.findById(commentID)
    if (!comment) throw new Error("COMMENT_NOT_FOUND")
    next()
  } catch (error) {
    console.error(`[COMMENT_MIDDLEWARE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      COMMENT_NOT_FOUND: { status: 404, message: "O comentário principal não foi encontrado ou não existe." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = commentMiddleware

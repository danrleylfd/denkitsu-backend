const { verify } = require("jsonwebtoken")
const User = require("../models/auth")

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const queryToken = req.query.token

    let token

    if (authHeader) {
      const parts = authHeader.split(" ")
      if (parts.length !== 2) throw new Error("TOKEN_PARTS_ERROR")
      const [scheme, headerToken] = parts
      if (!/^Bearer$/i.test(scheme)) throw new Error("TOKEN_SCHEMA_ERROR")
      token = headerToken
    } else if (queryToken) {
      token = queryToken
    } else {
      throw new Error("TOKEN_MISSING")
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    if (!decoded) throw new Error("TOKEN_INVALID")

    const user = await User.findById(decoded.id)
    if (!user) throw new Error("USER_NOT_FOUND")
    req.user = user
    req.userID = user._id
    return next()
  } catch (error) {
    console.error(`[AUTH_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      TOKEN_MISSING: { status: 401, message: "Nenhum token de autenticação fornecido." },
      TOKEN_PARTS_ERROR: { status: 401, message: "Formato de token inválido." },
      TOKEN_SCHEMA_ERROR: { status: 401, message: "O token deve ser do tipo 'Bearer'." },
      TOKEN_INVALID: { status: 401, message: "Token inválido ou expirado." },
      USER_NOT_FOUND: { status: 404, message: "Usuário associado ao token não encontrado." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = authMiddleware

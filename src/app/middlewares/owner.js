const ownerMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new Error("TOKEN_MISSING")

    const parts = authHeader.split(" ")
    if (parts.length !== 2) throw new Error("TOKEN_PARTS_ERROR")

    const [scheme, token] = parts
    if (!/^Bearer$/i.test(scheme)) throw new Error("TOKEN_SCHEMA_ERROR")

    if (token !== process.env.OWNER) throw new Error("TOKEN_INVALID")
    next()
  } catch (error) {
    console.error(`[OWNER_MIDDLEWARE] ${new Date().toISOString()} - `, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      TOKEN_MISSING: { status: 401, message: "Nenhum token de autorização fornecido." },
      TOKEN_PARTS_ERROR: { status: 401, message: "Formato de token inválido." },
      TOKEN_SCHEMA_ERROR: { status: 401, message: "O token deve ser do tipo 'Bearer'." },
      TOKEN_INVALID: { status: 401, message: "Token inválido." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = ownerMiddleware

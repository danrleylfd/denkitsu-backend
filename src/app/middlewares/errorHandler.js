const errorHandler = (error, req, res, next) => {
  console.error(`[GLOBAL_ERROR_HANDLER] ${new Date().toISOString()} - `, {
    message: error.message,
    stack: error.stack,
    request: { method: req.method, url: req.originalUrl, ip: req.clientIp }
  })
  if (error.isOperational) return res.status(error.statusCode).json({ error: { code: error.errorCode, message: error.message } })
  const isDevelopment = process.env.NODE_ENV === "development"
  const response = { error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro interno inesperado no servidor." } }
  if (isDevelopment) response.error.stack = error.stack
  return res.status(500).json(response)
}

module.exports = errorHandler

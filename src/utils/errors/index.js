const createAppError = (message, statusCode = 500, errorCode = "INTERNAL_ERROR") => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.errorCode = errorCode
  error.isOperational = true
  return error
}

module.exports = createAppError

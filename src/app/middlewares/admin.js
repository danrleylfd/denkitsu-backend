const adminMiddleware = (req, res, next) => {
  const apiKey = req.header("X-Internal-API-Key")
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) return res.sendStatus(404)
  return next()
}

module.exports = adminMiddleware

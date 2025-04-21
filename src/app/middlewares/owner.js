module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No token provided." })

    const parts = authHeader.split(" ")
    if (parts.length !== 2) return res.status(401).json({ error: "Token error." })

    const [scheme, token] = parts
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: "Token malformatted." })

    if (token !== process.env.OWNER) return res.status(401).json({ error: "Token invalid." })
    next()
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

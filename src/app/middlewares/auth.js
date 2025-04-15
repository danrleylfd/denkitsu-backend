const { verify } = require("jsonwebtoken")

module.exports = (req, res, next) => {
  try {
    req.query.id = undefined
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No token provided" })

    const parts = authHeader.split(" ")
    if (parts.length !== 2) return res.status(401).json({ error: "Token error" })

    const [scheme, token] = parts
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: "Token malformatted" })

    verify(token, process.env.JWT_SECRET_SHA512, { algorithms: ["HS512"] }, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Token invalid" })
      req.query.id = decoded.id
      return next()
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const githubConnect = (req, res) => {
  // O req.userID é fornecido pelo authMiddleware, garantindo que o usuário está logado
  const { userID } = req

  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
  const scope = "read:user user:email"

  // Usamos o parâmetro 'state' para passar o ID do nosso usuário de forma segura através do redirect do GitHub
  const state = userID

  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}&state=${state}`

  res.redirect(url)
}

module.exports = githubConnect

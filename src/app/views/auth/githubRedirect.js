const githubRedirect = (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
  const scope = "read:user user:email" // Solicita permissão para ler perfil e e-mail
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}`
  res.redirect(url)
}

module.exports = githubRedirect

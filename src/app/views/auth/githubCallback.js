const axios = require("axios")
const User = require("../../models/auth")
const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

const githubCallback = async (req, res) => {
  const { code } = req.query
  if (!code) {
    return res.status(400).json({ error: "Código de autorização do GitHub não fornecido." })
  }

  try {
    // 1. Troca o 'code' temporário pelo 'access_token'
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    )

    const { access_token } = tokenResponse.data
    if (!access_token) {
      throw new Error("Falha ao obter o token de acesso do GitHub.")
    }

    // 2. Usa o access_token para buscar os dados do usuário no GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const githubUser = userResponse.data

    // 3. Procura ou cria o usuário no seu banco de dados
    let user = await User.findOne({ githubId: githubUser.id })

    if (!user) {
      // Se o usuário não existe pelo githubId, tenta encontrar pelo email (se houver)
      if (githubUser.email) {
        user = await User.findOne({ email: githubUser.email })
        if (user) {
          // Se encontrou por e-mail, apenas vincula a conta existente ao GitHub
          user.githubId = githubUser.id
          await user.save()
        }
      }

      // Se ainda não há usuário, cria um novo
      if (!user) {
        user = await User.create({
          githubId: githubUser.id,
          name: githubUser.name || githubUser.login,
          email: githubUser.email, // Pode ser nulo se o e-mail for privado no GitHub
          avatarUrl: githubUser.avatar_url,
          // O campo 'password' não é obrigatório para usuários do GitHub
        })
      }
    }

    // 4. Gera os tokens da SUA aplicação para o usuário logado
    const token = generateToken({ id: user._id })
    const refreshToken = generateRefreshToken({ id: user._id })
    const userPayload = { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }

    // 5. Redireciona de volta para o frontend com os dados necessários
    const userParam = encodeURIComponent(JSON.stringify(userPayload))
    res.redirect(`${process.env.HOST1}/auth/github/callback?token=${token}&refreshToken=${refreshToken}&user=${userParam}`)

  } catch (error) {
    console.error("Erro no callback do GitHub:", error.response ? error.response.data : error.message)
    res.redirect(`${process.env.HOST1}/signin?error=github_failed`)
  }
}

module.exports = githubCallback

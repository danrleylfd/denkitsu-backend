const axios = require("axios")
const User = require("../../models/auth")
const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

const githubCallback = async (req, res) => {
  const { code } = req.query
  if (!code) {
    return res.status(400).json({ error: "Código de autorização do GitHub não fornecido." })
  }

  try {
    // 1. Troca o 'code' pelo 'access_token'
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

    // 2. Busca os dados do usuário e a lista de e-mails em paralelo
    const userPromise = axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const emailsPromise = axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
    })

    const [userResponse, emailsResponse] = await Promise.all([userPromise, emailsPromise])
    const githubUser = userResponse.data

    // Encontra o e-mail primário e verificado na lista
    const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified)?.email
    const emailToUse = primaryEmail || githubUser.email // Usa o primário, ou o público como fallback

    // 3. Procura ou cria o usuário no seu banco de dados
    let user = await User.findOne({ githubId: githubUser.id })

    if (!user) {
      // Se não encontrou pelo ID do GitHub, tenta pelo e-mail verificado
      if (emailToUse) {
        user = await User.findOne({ email: emailToUse })
        if (user) {
          // Vincula a conta existente ao ID do GitHub
          user.githubId = githubUser.id
          await user.save()
        }
      }

      // Se ainda não há usuário, cria um novo
      if (!user) {
        user = await User.create({
          githubId: githubUser.id,
          name: githubUser.name || githubUser.login,
          email: emailToUse, // Usa o e-mail verificado
          avatarUrl: githubUser.avatar_url,
        })
      }
    }

    // 4. Gera os tokens da SUA aplicação
    const token = generateToken({ id: user._id })
    const refreshToken = generateRefreshToken({ id: user._id })
    const userPayload = { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }

    // 5. Redireciona de volta para o frontend
    const userParam = encodeURIComponent(JSON.stringify(userPayload))
    res.redirect(`${process.env.HOST1}/auth/github/callback?token=${token}&refreshToken=${refreshToken}&user=${userParam}`)

  } catch (error) {
    console.error("Erro no callback do GitHub:", error.response ? error.response.data : error.message)
    res.redirect(`${process.env.HOST1}/signin?error=github_failed`)
  }
}

module.exports = githubCallback

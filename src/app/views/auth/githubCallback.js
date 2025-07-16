const axios = require("axios")
const User = require("../../models/auth")
const { generateToken, generateRefreshToken } = require("../../../utils/services/auth")

const githubCallback = async (req, res) => {
  const { code, state: userID } = req.query

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

    let user

    // 3. Lida com os diferentes fluxos (Login, Vinculação, Cadastro)
    if (userID) {
      // --- FLUXO DE VINCULAÇÃO ---
      // O usuário já está logado e o 'state' contém seu ID
      const userToLink = await User.findById(userID).select("+githubAccessToken")
      if (!userToLink) throw new Error("Usuário para vincular não encontrado.")

      // Verifica se a conta do GitHub já está vinculada a OUTRO usuário
      const existingGithubAccount = await User.findOne({ githubId: githubUser.id })
      if (existingGithubAccount && existingGithubAccount._id.toString() !== userID) {
          throw new Error("Esta conta do GitHub já está vinculada a outro usuário.")
      }

      userToLink.githubId = githubUser.id
      userToLink.githubAccessToken = access_token
      await userToLink.save()
      user = userToLink
    } else {
      // --- FLUXO DE LOGIN OU CADASTRO ---
      // O usuário não está logado
      user = await User.findOne({ githubId: githubUser.id }).select("+githubAccessToken")

      if (!user) {
        // Se não encontrou pelo ID do GitHub, busca o e-mail primário para tentar vincular
        const emailsResponse = await axios.get("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${access_token}` } })
        const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified)?.email
        const emailToUse = primaryEmail || githubUser.email

        if (emailToUse) {
          user = await User.findOne({ email: emailToUse }).select("+githubAccessToken")
          if (user) {
            // Encontrou usuário por e-mail, então vincula o ID do GitHub
            user.githubId = githubUser.id
          }
        }

        if (!user) {
          // Se ainda não há usuário, cria um novo
          user = await User.create({
            githubId: githubUser.id,
            name: githubUser.name || githubUser.login,
            email: emailToUse,
            avatarUrl: githubUser.avatar_url,
          })
        }
      }

      // Garante que o token de acesso seja sempre atualizado no login/cadastro
      user.githubAccessToken = access_token
      await user.save()
    }

    // 4. Gera os tokens da SUA aplicação para o usuário logado
    const token = generateToken({ id: user._id })
    const refreshToken = generateRefreshToken({ id: user._id })
    const userPayload = { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, githubId: user.githubId }

    // 5. Redireciona de volta para o frontend
    const userParam = encodeURIComponent(JSON.stringify(userPayload))
    const redirectUrl = userID
      ? `${process.env.HOST1}/profile` // Se era vinculação, volta para o perfil
      : `${process.env.HOST1}/auth/github/callback?token=${token}&refreshToken=${refreshToken}&user=${userParam}`

    res.redirect(redirectUrl)

  } catch (error) {
    console.error("Erro no callback do GitHub:", error.response ? error.response.data : error.message)
    const errorMessage = encodeURIComponent(error.message)
    res.redirect(`${process.env.HOST1}/signin?error=${errorMessage || "github_failed"}`)
  }
}

module.exports = githubCallback

const axios = require("axios")
const User = require("../../models/auth")
const { generateToken, generateRefreshToken } = require("../../../utils/api/auth")

const githubCallback = async (req, res) => {
  const { code, state: userID } = req.query
  try {
    if (!code) throw new Error("GITHUB_CODE_MISSING")
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
    if (!access_token) throw new Error("GITHUB_TOKEN_FETCH_FAILED")
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const githubUser = userResponse.data
    let user
    if (userID) {
      const userToLink = await User.findById(userID).select("+githubAccessToken")
      if (!userToLink) throw new Error("USER_LINK_NOT_FOUND")
      const existingGithubAccount = await User.findOne({ githubId: githubUser.id })
      if (existingGithubAccount && existingGithubAccount._id.toString() !== userID) throw new Error("GITHUB_ACCOUNT_IN_USE")
      userToLink.githubId = githubUser.id
      userToLink.githubAccessToken = access_token
      await userToLink.save()
      user = userToLink
    } else {
      user = await User.findOne({ githubId: githubUser.id }).select("+githubAccessToken")
      if (!user) {
        const emailsResponse = await axios.get("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${access_token}` } })
        const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified)?.email
        const emailToUse = primaryEmail || githubUser.email
        if (emailToUse) {
          user = await User.findOne({ email: emailToUse }).select("+githubAccessToken")
          if (user) user.githubId = githubUser.id
        }
        if (!user) {
          user = await User.create({
            githubId: githubUser.id,
            name: githubUser.name || githubUser.login,
            email: emailToUse,
            avatarUrl: githubUser.avatar_url,
          })
        }
      }
      user.githubAccessToken = access_token
      await user.save()
    }
    const token = generateToken({ id: user._id })
    const refreshToken = generateRefreshToken({ id: user._id })
    const userPayload = { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, githubId: user.githubId }
    const userParam = encodeURIComponent(JSON.stringify(userPayload))
    const redirectUrl = userID
      ? `${process.env.HOST1}/profile`
      : `${process.env.HOST1}/auth/github/callback?token=${token}&refreshToken=${refreshToken}&user=${userParam}`
    res.redirect(redirectUrl)
  } catch (error) {
    console.error("Erro no callback do GitHub:", error.message)
    const knownErrorCodes = [
      "GITHUB_CODE_MISSING",
      "GITHUB_TOKEN_FETCH_FAILED",
      "USER_LINK_NOT_FOUND",
      "GITHUB_ACCOUNT_IN_USE"
    ]
    const errorCode = knownErrorCodes.includes(error.message) ? error.message : "GITHUB_AUTH_FAILED"
    res.redirect(`${process.env.HOST1}/signin?error_code=${errorCode}`)
  }
}

module.exports = githubCallback

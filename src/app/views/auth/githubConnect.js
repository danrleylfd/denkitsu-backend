const githubConnect = (req, res) => {
  const { userID } = req
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
  const scope = "read:user user:email"
  const state = userID
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}&state=${state}`
  res.redirect(url)
}

module.exports = githubConnect

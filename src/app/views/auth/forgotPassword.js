const { renderFile } = require("ejs")
const User = require("../../models/auth")
const mailer = require("../../../utils/api/mail")
const { generateOTPToken, generateOTPCode } = require("../../../utils/api/auth")
const createAppError = require("../../../utils/errors")

const forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) {
    const token = generateOTPCode() || generateOTPToken()
    const now = new Date()
    now.setMinutes(now.getMinutes() + 3)
    user.passwordResetToken = token
    user.passwordResetExpires = now
    await user.save()
    const html = await renderFile(`${__dirname}/../../../utils/templates/forgotPassword.ejs`, {
      username: user.name,
      token
    })
    await new Promise((resolve, reject) => {
      mailer.sendMail({ to: email, subject: "Token de recuperação", html }, (err, info) => {
        if (err) return reject(createAppError("Não foi possível enviar o e-mail de recuperação.", 502, "MAIL_SEND_FAILURE"))
        resolve(info)
      })
    })
  }
  return res.status(200).json({ message: "Se um usuário com este e-mail existir, um token de recuperação foi enviado." })
}

module.exports = forgotPassword

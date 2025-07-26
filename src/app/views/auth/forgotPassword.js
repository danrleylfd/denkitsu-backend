const { renderFile } = require("ejs")

const User = require("../../models/auth")
const mailer = require("../../../utils/api/mail")

const { generateOTPToken, generateOTPCode } = require("../../../utils/api/auth")

const forgotPassword = async (req, res) => {
  try {
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
    }
    mailer.sendMail({ to: email, subject: "Token de recuperação", html }, (err) => {
      if (err) {
        console.error(`[MAIL_ERROR] ${new Date().toISOString()} -`, { error: err.message, stack: err.stack })
        throw new Error("MAIL_ERROR")
      }
    })
    return res.status(200).send()
  } catch (error) {
    if (error.message !== "MAIL_ERROR") {
      console.error(`[FORGOT_PASSWORD] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    }
    const defaultError = { status: 500, message: "Ocorreu um erro inesperado." }
    const errorMessages = {
      MAIL_ERROR: { status: 500, message: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = forgotPassword

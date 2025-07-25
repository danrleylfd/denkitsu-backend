const { renderFile } = require("ejs")

const User = require("../../models/auth")
const mailer = require("../../../utils/api/mail")

const { generateOTPToken, generateOTPCode } = require("../../../utils/api/auth")

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.trim()) throw new Error("EMAIL_MISSING")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) throw new Error("EMAIL_INVALID")
    const user = await User.findOne({ email })
    if (!user) throw new Error("USER_NOT_FOUND")
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
    mailer.sendMail({ to: email, subject: "Token de recuperação", html }, (err) => {
      if (err) throw new Error("MAIL_ERROR")
    })
    return res.status(200).send()
  } catch (error) {
    console.error(`[FORGOT_PASSWORD] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    const defaultError = { status: 500, message: `[FORGOT_PASSWORD] ${new Date().toISOString()} - Internal server error` }
    const errorMessages = {
      EMAIL_MISSING: { status: 422, message: "email is required" },
      EMAIL_INVALID: { status: 422, message: "email is invalid" },
      USER_NOT_FOUND: { status: 404, message: "user not found/exists" },
      MAIL_ERROR: { status: 500, message: "error sending email" }
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ code: error.message, message })
  }
}

module.exports = forgotPassword

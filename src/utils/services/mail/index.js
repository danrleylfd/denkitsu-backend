const { createTransport } = require("nodemailer")

const mailConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
}

const transporter = createTransport(mailConfig)
module.exports = transporter

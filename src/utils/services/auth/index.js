const { sign: jwtSign } = require("jsonwebtoken")
const { randomBytes } = require("crypto")

module.exports.authConfig = {
  otp: {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: false
  }
}

module.exports.generateToken = (data = {}) => {
  return jwtSign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
    algorithm: "HS512"
  })
}

module.exports.generateOTPToken = (counter = 20) => {
  const otpToken = randomBytes(counter).toString("hex")
  return otpToken
}

module.exports.generateOTPCode = (
  counter = 6,
  options = this.authConfig.otp
) => {
  let characters = ""
  const { digits, lowerCaseAlphabets, upperCaseAlphabets, specialChars } =
    options
  if (digits) characters += "0123456789"
  if (lowerCaseAlphabets) characters += "abcdefghijklmnopqrstuvwxyz"
  if (upperCaseAlphabets) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (specialChars) characters += "!@#$%^&*()_+-=[]{}|;:,.<>?"
  let otp = ""
  for (let i = 0; i < counter; i++) {
    otp += characters[Math.floor(Math.random() * characters.length)]
  }
  return otp
}

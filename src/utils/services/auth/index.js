const { sign: jwtSign } = require("jsonwebtoken")
const { randomBytes } = require("crypto")

module.exports.authConfig = {
  unhashed: "Backend Core",
  secret: "8f170f6540d4a39c6347b9c254640bd1",
  type: "hash-md5",
  otp: {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: false
  }
}

module.exports.generateToken = (data = {}) => {
  return jwtSign(data, this.authConfig.secret, {
    expiresIn: 86400 // segundos = 1 dia
  })
}

module.exports.generateOTPToken = (counter = 20) => {
  const otpToken = randomBytes(counter).toString("hex")
  return otpToken
}

module.exports.generateOTPCode = (counter = 6, options = this.authConfig.otp) => {
  let characters = ""
  const { digits, lowerCaseAlphabets, upperCaseAlphabets } = options
  if (digits) characters += "0123456789"
  if (lowerCaseAlphabets) characters += "abcdefghijklmnopqrstuvwxyz"
  if (upperCaseAlphabets) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let otp = ""
  for (let i = 0; i < counter; i++) {
    otp += characters[Math.floor(Math.random() * characters.length)]
  }
  return otp
}

const axios = require("axios")

const tiktokToken = "0e8abe969d4211cf8d94047860d2f324771a901ccf7f9bdc345362754352241b"

const tiktokAPI = axios.create({
  baseURL: "https://ssstik.io/abc?url=dl",
  headers: {
    origin: "https://ssstik.io",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
  }
})

module.exports = { tiktokToken, tiktokAPI }

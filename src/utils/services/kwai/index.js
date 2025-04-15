const axios = require("axios")

const kwaiToken = "0e8abe969d4211cf8d94047860d2f324771a901ccf7f9bdc345362754352241b"

const kwaiAPI = axios.create({
  baseURL: "https://magicdown.net/wp-json/aio-dl/video-data/",
  headers: {
    origin: "https://magicdown.net",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
  }
})

module.exports = { kwaiToken, kwaiAPI }

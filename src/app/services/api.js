const axios = require("axios")

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8080}`
})

module.exports = api

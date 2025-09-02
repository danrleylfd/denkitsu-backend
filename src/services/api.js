const axios = require("axios")

// Instância do Axios para o backend chamar a si mesmo de forma segura
const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8080}`
})

module.exports = api

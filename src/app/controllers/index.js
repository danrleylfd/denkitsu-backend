const { readdirSync } = require("fs")
const { resolve } = require("path")

const loadRoutes = (app) => {
  readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach((file) => require(resolve(__dirname, file))(app))
}

module.exports = loadRoutes

const { readdirSync } = require("fs")
const { resolve } = require("path")

module.exports = (app) => {
  console.log("Loading routes...")
  readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach((file) => require(resolve(__dirname, file))(app))
  console.log("All routes loaded!")
}

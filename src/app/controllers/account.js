const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")

const routes = Router()
routes.use(authMiddleware)

const getUser = require("../views/account/getUser")
const editAccount = require("../views/account/editAccount")
const deleteAccount = require("../views/account/deleteAccount")
const unlinkGithub = require("../views/account/unlinkGithub") // NOVO

routes.get("/", getUser)

routes.get("/:userID", getUser)

routes.put("/", editAccount)

routes.delete("/", deleteAccount)

routes.delete("/github/unlink", unlinkGithub)

const loadAccountRoutes = (app) => app.use("/account", routes)

module.exports = loadAccountRoutes

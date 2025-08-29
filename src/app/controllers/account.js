const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const { editAccountRules, getUserRules } = require("../validators/account")

const routes = Router()
routes.use(authMiddleware)

const getUser = require("../views/account/getUser")
const editAccount = require("../views/account/editAccount")
const deleteAccount = require("../views/account/deleteAccount")
const unlinkGithub = require("../views/account/unlinkGithub")

routes.get("/", asyncHandler(getUser))

routes.get("/:userID", getUserRules(), validate, asyncHandler(getUser))

routes.put("/", editAccountRules(), validate, asyncHandler(editAccount))

routes.delete("/", asyncHandler(deleteAccount))

routes.delete("/github/unlink", asyncHandler(unlinkGithub))

const loadAccountRoutes = (app) => app.use("/account", routes)

module.exports = loadAccountRoutes

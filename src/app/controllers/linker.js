const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const validate = require("../middlewares/validator")
const {
  createLinkerRules,
  readOneRules,
  updateLinkerRules,
  deleteLinkerRules,
} = require("../validators/linker")

const routes = Router()
routes.use(authMiddleware)

const createOne = require("../views/linker/createOne")
const readMany = require("../views/linker/readMany")
const updateOne = require("../views/linker/updateOne")
const deleteOne = require("../views/linker/deleteOne")

routes.post("/", createLinkerRules(), validate, createOne)

routes.get("/", readMany)

routes.get("/by-user", readMany)

routes.put("/:oldLabel", updateLinkerRules(), validate, updateOne)

routes.delete("/:label", deleteLinkerRules(), validate, deleteOne)

const loadLinkerRoutes = (app) => app.use("/linkers", routes)

module.exports = loadLinkerRoutes

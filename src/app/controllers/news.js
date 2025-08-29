const { Router } = require("express")

const validate = require("../middlewares/validator")
const {
  createNewsRules,
  generateNewsRules,
  paginateRules,
  cursorRules,
  sourceInParamsRules
} = require("../validators/news")

const routes = Router()

const createOne = require("../views/news/createOne")
const generateOne = require("../views/news/generateOne")
const readOneBySource = require("../views/news/readOneBySource")
const readMany = require("../views/news/readMany")
const readManyPaginate = require("../views/news/readManyPaginate")
const readManyCursor = require("../views/news/readManyCursor")

routes.post("/", createNewsRules(), validate, createOne)

routes.post("/generate", generateNewsRules(), validate, generateOne)

routes.get("/", readMany)

routes.get("/pages", paginateRules(), validate, readManyPaginate)

routes.get("/cursor", cursorRules(), validate, readManyCursor)

routes.get("/:source", sourceInParamsRules(), validate, readOneBySource)

const loadNewsRoutes = (app) => app.use("/news", routes)

module.exports = loadNewsRoutes

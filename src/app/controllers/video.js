const { Router } = require("express")
const authMiddleware = require("../middlewares/auth")
const validate = require("../middlewares/validator")
const {
  createVideoRules,
  updateVideoRules,
  deleteVideoRules,
  readOneVideoRules,
  readUserVideosRules
} = require("../validators/videoValidator")

const routes = Router()

routes.use(authMiddleware)

const createOne = require("../views/video/createOne")
const readRecents = require("../views/video/readRecents")
const readPopular = require("../views/video/readPopular")
const readManyByUser = require("../views/video/readManyByUser")
const readOne = require("../views/video/readOne")
const updateOne = require("../views/video/updateOne")
const deleteOne = require("../views/video/deleteOne")

routes.post("/", createVideoRules(), validate, createOne)

routes.get("/", readManyByUser)

routes.get("/one/:video", readOneVideoRules(), validate, readOne)

routes.get("/popular", readPopular)

routes.get("/recents", readRecents)

routes.get("/:userID", readUserVideosRules(), validate, readManyByUser)

routes.put("/:video", updateVideoRules(), validate, updateOne)

routes.delete("/:video", deleteVideoRules(), validate, deleteOne)

const loadVideoRoutes = (app) => app.use("/videos", routes)

module.exports = loadVideoRoutes

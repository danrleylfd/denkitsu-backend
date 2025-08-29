const { Router } = require("express")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")
const validate = require("../middlewares/validator")
const {
  createVideoRules,
  updateVideoRules,
  deleteVideoRules,
  readOneVideoRules,
  readUserVideosRules
} = require("../validators/video")

const routes = Router()

routes.use(authMiddleware)

const createOne = require("../views/video/createOne")
const readRecents = require("../views/video/readRecents")
const readPopular = require("../views/video/readPopular")
const readManyByUser = require("../views/video/readManyByUser")
const readOne = require("../views/video/readOne")
const updateOne = require("../views/video/updateOne")
const deleteOne = require("../views/video/deleteOne")

routes.post("/", createVideoRules(), validate, asyncHandler(createOne))

routes.get("/", asyncHandler(readManyByUser))

routes.get("/one/:video", readOneVideoRules(), validate, asyncHandler(readOne))

routes.get("/popular", asyncHandler(readPopular))

routes.get("/recents", asyncHandler(readRecents))

routes.get("/:userID", readUserVideosRules(), validate, asyncHandler(readManyByUser))

routes.put("/:video", updateVideoRules(), validate, asyncHandler(updateOne))

routes.delete("/:video", deleteVideoRules(), validate, asyncHandler(deleteOne))

const loadVideoRoutes = (app) => app.use("/videos", routes)

module.exports = loadVideoRoutes

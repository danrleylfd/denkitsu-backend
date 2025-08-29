const { Router } = require("express")
const multer = require("multer")

const authMiddleware = require("../middlewares/auth")
const asyncHandler = require("../middlewares/asyncHandler")

const transcribeAudio = require("../views/audio/transcribe")

const routes = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

routes.use(authMiddleware)

routes.post("/transcribe", upload.single("audio"), asyncHandler(transcribeAudio))

const loadAudioRoutes = (app) => app.use("/audio", routes)

module.exports = loadAudioRoutes

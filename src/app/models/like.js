const mongoose = require("../../utils/database")

const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true }
  },
  { timestamps: true }
)

LikeSchema.index({ user: 1, video: 1 }, { unique: true })

module.exports = mongoose.model("Like", LikeSchema)

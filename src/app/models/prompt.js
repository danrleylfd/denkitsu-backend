const mongoose = require("../../utils/database")

const PromptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Prompt", PromptSchema)
